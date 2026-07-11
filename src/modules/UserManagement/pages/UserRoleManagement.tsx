import { useState, useMemo } from "react";
import { getStorage, setStorage } from "../../../utils/storage";
import { useForm, Controller } from "react-hook-form";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Badge from "../../../components/ui/badge/Badge";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select";
import Checkbox from "../../../components/form/input/Checkbox";
import { Modal } from "../../../components/ui/modal";
import { useModal } from "../../../hooks/useModal";
import { Dropdown } from "../../../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../../../components/ui/dropdown/DropdownItem";
import { Pagination } from "../../../components/ui/pagination/Pagination";
import { useToast } from "../../../hooks/useToast";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../../../components/ui/table";
import {
  ChevronDownIcon,
  ChevronUpIcon,
} from "../../../icons";
import { FiEye, FiEdit, FiTrash2, FiPlus } from "react-icons/fi";

interface Permission {
  menu: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

interface Role {
  id: number;
  roleName: string;
  description?: string;
  status: "Active" | "Inactive";
  permissions: Permission[];
}

const defaultPermissionsList: Permission[] = [
  { menu: "Dashboard", view: false, create: false, edit: false, delete: false },
  { menu: "Master Config", view: false, create: false, edit: false, delete: false },
  { menu: "User Management", view: false, create: false, edit: false, delete: false },
  { menu: "Lead Management", view: false, create: false, edit: false, delete: false },
  { menu: "Connect", view: false, create: false, edit: false, delete: false },
  { menu: "Meeting Management", view: false, create: false, edit: false, delete: false },
  { menu: "Reports", view: false, create: false, edit: false, delete: false },
];

const initialRoles: Role[] = [
  {
    id: 1,
    roleName: "Administrator",
    description: "Full system access to all modules, records, and configurations.",
    status: "Active",
    permissions: [
      { menu: "Dashboard", view: true, create: true, edit: true, delete: true },
      { menu: "Master Config", view: true, create: true, edit: true, delete: true },
      { menu: "User Management", view: true, create: true, edit: true, delete: true },
      { menu: "Lead Management", view: true, create: true, edit: true, delete: true },
      { menu: "Connect", view: true, create: true, edit: true, delete: true },
      { menu: "Meeting Management", view: true, create: true, edit: true, delete: true },
      { menu: "Reports", view: true, create: true, edit: true, delete: true },
    ],
  },
  {
    id: 2,
    roleName: "Business Development Manager",
    description: "Manage BDM team, view pipeline reports, and assign incoming leads.",
    status: "Active",
    permissions: [
      { menu: "Dashboard", view: true, create: true, edit: true, delete: true },
      { menu: "Master Config", view: true, create: false, edit: false, delete: false },
      { menu: "User Management", view: true, create: true, edit: true, delete: false },
      { menu: "Lead Management", view: true, create: true, edit: true, delete: true },
      { menu: "Connect", view: true, create: true, edit: true, delete: true },
      { menu: "Meeting Management", view: true, create: true, edit: true, delete: true },
      { menu: "Reports", view: true, create: false, edit: false, delete: false },
    ],
  },
  {
    id: 3,
    roleName: "Business Development Executive",
    description: "Add leads, log customer follow-ups, and coordinate meeting bookings.",
    status: "Active",
    permissions: [
      { menu: "Dashboard", view: true, create: false, edit: false, delete: false },
      { menu: "Master Config", view: false, create: false, edit: false, delete: false },
      { menu: "User Management", view: false, create: false, edit: false, delete: false },
      { menu: "Lead Management", view: true, create: true, edit: true, delete: false },
      { menu: "Connect", view: true, create: true, edit: true, delete: false },
      { menu: "Meeting Management", view: true, create: true, edit: true, delete: false },
      { menu: "Reports", view: false, create: false, edit: false, delete: false },
    ],
  },
  {
    id: 4,
    roleName: "Presales Consultant",
    description: "Evaluate lead technical requirements and draft solution proposal details.",
    status: "Active",
    permissions: [
      { menu: "Dashboard", view: true, create: false, edit: false, delete: false },
      { menu: "Master Config", view: false, create: false, edit: false, delete: false },
      { menu: "User Management", view: false, create: false, edit: false, delete: false },
      { menu: "Lead Management", view: true, create: false, edit: true, delete: false },
      { menu: "Connect", view: false, create: false, edit: false, delete: false },
      { menu: "Meeting Management", view: true, create: false, edit: true, delete: false },
      { menu: "Reports", view: false, create: false, edit: false, delete: false },
    ],
  },
  {
    id: 5,
    roleName: "Guest User",
    description: "Read-only access to basic performance metric counts on the dashboard.",
    status: "Inactive",
    permissions: [
      { menu: "Dashboard", view: true, create: false, edit: false, delete: false },
      { menu: "Master Config", view: false, create: false, edit: false, delete: false },
      { menu: "User Management", view: false, create: false, edit: false, delete: false },
      { menu: "Lead Management", view: false, create: false, edit: false, delete: false },
      { menu: "Connect", view: false, create: false, edit: false, delete: false },
      { menu: "Meeting Management", view: false, create: false, edit: false, delete: false },
      { menu: "Reports", view: false, create: false, edit: false, delete: false },
    ],
  },
];

interface RoleFormValues {
  roleName: string;
  description?: string;
  status: "Active" | "Inactive";
  permissions: Permission[];
}

export default function UserRoleManagement() {
  const { showToast } = useToast();
  const [roles, setRoles] = useState<Role[]>(() => getStorage("clienzo_roles", initialRoles));
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Role>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Dropdown states
  const [statusFilter, setStatusFilter] = useState("all");
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);

  // Modal states
  const viewModal = useModal();
  const formModal = useModal();
  const deleteModal = useModal();

  // Active items mapping
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");

  // React Hook Form
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<RoleFormValues>({
    defaultValues: {
      roleName: "",
      description: "",
      status: "Active",
      permissions: defaultPermissionsList,
    },
  });

  const currentPermissions = watch("permissions") || defaultPermissionsList;

  const handlePermissionChange = (
    index: number,
    field: "view" | "create" | "edit" | "delete",
    checked: boolean
  ) => {
    const updated = [...currentPermissions];
    updated[index] = {
      ...updated[index],
      [field]: checked,
    };
    setValue("permissions", updated);
  };

  // Handlers
  const handleOpenView = (role: Role) => {
    setSelectedRole(role);
    viewModal.openModal();
  };

  const handleOpenCreate = () => {
    setModalMode("create");
    setSelectedRole(null);
    reset({
      roleName: "",
      description: "",
      status: "Active",
      permissions: defaultPermissionsList.map((p) => ({ ...p })),
    });
    formModal.openModal();
  };

  const handleOpenEdit = (role: Role) => {
    setModalMode("edit");
    setSelectedRole(role);
    reset({
      roleName: role.roleName,
      description: role.description,
      status: role.status,
      permissions: (role.permissions || defaultPermissionsList).map((p) => ({ ...p })),
    });
    formModal.openModal();
  };

  const handleOpenDelete = (role: Role) => {
    setSelectedRole(role);
    deleteModal.openModal();
  };

  const handleSaveRole = (data: RoleFormValues) => {
    if (modalMode === "create") {
      const newId = roles.length > 0 ? Math.max(...roles.map((r) => r.id)) + 1 : 1;
      const newRole: Role = {
        id: newId,
        roleName: data.roleName.trim(),
        status: data.status,
        permissions: data.permissions,
      };
      const updated = [...roles, newRole];
      setRoles(updated);
      setStorage("clienzo_roles", updated);
      showToast("Role created successfully.", "success");
    } else if (modalMode === "edit" && selectedRole) {
      const updated = roles.map((r) =>
        r.id === selectedRole.id
          ? {
              ...r,
              roleName: data.roleName.trim(),
              status: data.status,
              permissions: data.permissions,
            }
          : r
      );
      setRoles(updated);
      setStorage("clienzo_roles", updated);
      showToast("Role updated successfully.", "success");
    }
    formModal.closeModal();
  };

  const handleFormError = () => {
    showToast("Please fill all required fields.", "error");
  };

  const handleDeleteConfirm = () => {
    if (selectedRole) {
      const updated = roles.filter((r) => r.id !== selectedRole.id);
      setRoles(updated);
      setStorage("clienzo_roles", updated);
      showToast("Role deleted successfully.", "success");
    }
    deleteModal.closeModal();
  };

  // Sorting columns
  const handleSort = (field: keyof Role) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  // Filters & Sorting calculations
  const processedRoles = useMemo(() => {
    let result = [...roles];

    // 1. Search Query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.roleName.toLowerCase().includes(q) ||
          r.status.toLowerCase().includes(q)
      );
    }

    // 2. Status filter
    if (statusFilter !== "all") {
      result = result.filter((r) => r.status === statusFilter);
    }

    // 3. Sort column values
    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }

      const strA = String(aVal).toLowerCase();
      const strB = String(bVal).toLowerCase();

      if (strA < strB) return sortOrder === "asc" ? -1 : 1;
      if (strA > strB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [roles, searchQuery, statusFilter, sortField, sortOrder]);

  // Paginated elements calculation
  const paginatedRoles = useMemo(() => {
    const startIdx = (currentPage - 1) * rowsPerPage;
    return processedRoles.slice(startIdx, startIdx + rowsPerPage);
  }, [processedRoles, currentPage, rowsPerPage]);

  const totalItems = processedRoles.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  // Sorting header icons indicator renderer
  const renderSortHeader = (label: string, field: keyof Role, centered = false) => {
    const isActive = sortField === field;
    return (
      <button
        onClick={() => handleSort(field)}
        className={`flex items-center gap-1.5 font-medium hover:text-gray-900 dark:hover:text-white cursor-pointer ${
          centered ? "mx-auto justify-center" : ""
        }`}
      >
        {label}
        <span className="flex flex-col">
          <ChevronUpIcon
            className={`w-3 h-3 -mb-1 transition-colors ${
              isActive && sortOrder === "asc" ? "text-brand-500" : "text-gray-300 dark:text-gray-600"
            }`}
          />
          <ChevronDownIcon
            className={`w-3 h-3 transition-colors ${
              isActive && sortOrder === "desc" ? "text-brand-500" : "text-gray-300 dark:text-gray-600"
            }`}
          />
        </span>
      </button>
    );
  };

  return (
    <>
      <PageMeta
        title="User Role Management | ClienZo"
        description="Manage user roles and permissions in ClienZo CRM."
      />
      {/* Page Title & Breadcrumb */}
      <PageBreadcrumb pageTitle="User Role Management" />

      {/* Control Area above Table */}
      <div className="flex flex-col gap-4 mb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center w-full lg:w-auto">
          <div className="w-full sm:w-64">
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Custom Dropdown Filter for Status */}
          <div className="relative">
            <button
              onClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)}
              className="flex items-center justify-between h-11 w-40 rounded-lg border border-gray-205 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 cursor-pointer dropdown-toggle hover:bg-gray-50 dark:hover:bg-white/5"
            >
              <span>{statusFilter === "all" ? "All statuses" : statusFilter}</span>
              <ChevronDownIcon className="w-4 h-4 text-gray-555" />
            </button>
            <Dropdown
              isOpen={isStatusFilterOpen}
              onClose={() => setIsStatusFilterOpen(false)}
              className="left-0 right-auto w-40 p-1 mt-2"
            >
              <ul className="flex flex-col gap-0.5">
                {[
                  { value: "all", label: "All statuses" },
                  { value: "Active", label: "Active" },
                  { value: "Inactive", label: "Inactive" },
                ].map((opt) => (
                  <li key={opt.value}>
                    <DropdownItem
                      onItemClick={() => {
                        setStatusFilter(opt.value);
                        setCurrentPage(1);
                        setIsStatusFilterOpen(false);
                      }}
                      className={`cursor-pointer rounded-lg text-left w-full px-3 py-2 text-sm ${
                        statusFilter === opt.value
                          ? "bg-brand-500 text-white font-medium"
                          : "text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
                      }`}
                    >
                      {opt.label}
                    </DropdownItem>
                  </li>
                ))}
              </ul>
            </Dropdown>
          </div>
        </div>

        {/* Primary Action Button */}
        <div>
          <Button
            size="sm"
            onClick={handleOpenCreate}
            startIcon={<FiPlus className="size-4" />}
            className="w-full sm:w-auto h-11 px-4 py-2.5"
          >
            Add role
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] sticky top-0 bg-white dark:bg-gray-900 z-10">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-center text-theme-xs font-medium text-gray-500 dark:text-gray-400 w-[100px]"
                >
                  {renderSortHeader("S.No", "id", true)}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  {renderSortHeader("Role name", "roleName")}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-center text-theme-xs font-medium text-gray-500 dark:text-gray-400 w-[180px]"
                >
                  {renderSortHeader("Status", "status", true)}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-center text-theme-xs font-medium text-gray-500 dark:text-gray-400 w-[180px]"
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {paginatedRoles.length > 0 ? (
                paginatedRoles.map((role) => (
                  <TableRow
                    key={role.id}
                    className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-855 dark:text-white/90 text-center">
                      {role.id}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-855 dark:text-white/90 font-medium">
                      {role.roleName}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400 text-center">
                      <Badge size="sm" color={role.status === "Active" ? "success" : "error"}>
                        {role.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenView(role)}
                          className="p-1.5 text-gray-500 hover:text-brand-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition cursor-pointer"
                          title="View"
                        >
                          <FiEye className="size-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(role)}
                          className="p-1.5 text-gray-500 hover:text-brand-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition cursor-pointer"
                          title="Edit"
                        >
                          <FiEdit className="size-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(role)}
                          className="p-1.5 text-gray-500 hover:text-error-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition cursor-pointer"
                          title="Delete"
                        >
                          <FiTrash2 className="size-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No roles match your search criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Block */}
        {totalItems > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            rowsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={(rows) => {
              setRowsPerPage(rows);
              setCurrentPage(1);
            }}
            itemName="roles"
          />
        )}
      </div>

      {/* View Role Modal (Read-Only details) */}
      <Modal isOpen={viewModal.isOpen} onClose={viewModal.closeModal} className="max-w-[500px] m-4">
        <div className="relative w-full rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
          <div className="pr-10 border-b border-gray-150 pb-4 mb-4 dark:border-gray-800">
            <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">Role details</h4>
          </div>
          {selectedRole && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-gray-400 block">S.No</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {selectedRole.id}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Status</span>
                  <div className="mt-1">
                    <Badge
                      size="sm"
                      color={selectedRole.status === "Active" ? "success" : "error"}
                    >
                      {selectedRole.status}
                    </Badge>
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-gray-400 block">Role name</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {selectedRole.roleName}
                  </span>
                </div>

                {/* View Role Menu Privileges Matrix */}
                <div className="col-span-2 mt-4">
                  <span className="text-xs text-gray-400 block mb-2 font-medium">
                    Menu privileges
                  </span>
                  <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 max-h-[250px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left text-xs text-gray-500 dark:text-gray-400 border-collapse">
                      <thead className="bg-gray-100/70 dark:bg-gray-800/70 text-gray-700 dark:text-gray-300 font-semibold uppercase sticky top-0">
                        <tr>
                          <th className="px-3 py-2">Menu</th>
                          <th className="px-3 py-2 text-center">View</th>
                          <th className="px-3 py-2 text-center">Create</th>
                          <th className="px-3 py-2 text-center">Edit</th>
                          <th className="px-3 py-2 text-center">Delete</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-150 dark:divide-gray-800 text-gray-800 dark:text-white/80">
                        {(selectedRole.permissions || defaultPermissionsList).map((perm) => (
                          <tr key={perm.menu} className="hover:bg-gray-50 dark:hover:bg-white/[0.01]">
                            <td className="px-3 py-2 font-medium">{perm.menu}</td>
                            <td className="px-3 py-2 text-center">{perm.view ? "✅" : "❌"}</td>
                            <td className="px-3 py-2 text-center">{perm.create ? "✅" : "❌"}</td>
                            <td className="px-3 py-2 text-center">{perm.edit ? "✅" : "❌"}</td>
                            <td className="px-3 py-2 text-center">{perm.delete ? "✅" : "❌"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center justify-end mt-6">
            <Button size="sm" onClick={viewModal.closeModal}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create/Edit Form Modal */}
      <Modal isOpen={formModal.isOpen} onClose={formModal.closeModal} className="max-w-[650px] m-4">
        <div className="relative w-full rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
          <div className="pr-10 border-b border-gray-150 pb-4 mb-4 dark:border-gray-800">
            <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              {modalMode === "create" ? "Add role" : "Edit role"}
            </h4>
          </div>
          <form onSubmit={handleSubmit(handleSaveRole, handleFormError)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Role name <span className="text-error-500">*</span>
                </label>
                <Controller
                  name="roleName"
                  control={control}
                  rules={{
                    required: "Role name is required",
                    minLength: { value: 3, message: "Role name must be at least 3 characters" },
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      placeholder="Enter role name"
                      className={errors.roleName ? "border-error-500" : ""}
                    />
                  )}
                />
                {errors.roleName && (
                  <span className="mt-1.5 text-xs text-error-600 block">
                    {errors.roleName.message}
                  </span>
                )}
              </div>

              <div>
                <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status <span className="text-error-500">*</span>
                </label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <Select
                      options={[
                        { value: "Active", label: "Active" },
                        { value: "Inactive", label: "Inactive" },
                      ]}
                      placeholder="Select status"
                      defaultValue={value}
                      onChange={onChange}
                    />
                  )}
                />
              </div>

              {/* Menu Privileges Table with Toggles */}
              <div className="sm:col-span-2 mt-2">
                <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Menu privileges
                </label>
                <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20 max-h-[280px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left text-xs text-gray-500 dark:text-gray-400 border-collapse">
                    <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold uppercase sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800">
                      <tr>
                        <th className="px-4 py-2.5">Menu</th>
                        <th className="px-4 py-2.5 text-center">View</th>
                        <th className="px-4 py-2.5 text-center">Create</th>
                        <th className="px-4 py-2.5 text-center">Edit</th>
                        <th className="px-4 py-2.5 text-center">Delete</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150 dark:divide-gray-800 text-gray-800 dark:text-white/90">
                      {currentPermissions.map((perm, idx) => (
                        <tr
                          key={perm.menu}
                          className="hover:bg-gray-100/50 dark:hover:bg-white/[0.01]"
                        >
                          <td className="px-4 py-3.5 font-medium">{perm.menu}</td>
                          <td className="px-4 py-3.5 text-center">
                            <div className="flex justify-center">
                              <Checkbox
                                checked={perm.view}
                                onChange={(checked) => handlePermissionChange(idx, "view", checked)}
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <div className="flex justify-center">
                              <Checkbox
                                checked={perm.create}
                                onChange={(checked) =>
                                  handlePermissionChange(idx, "create", checked)
                                }
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <div className="flex justify-center">
                              <Checkbox
                                checked={perm.edit}
                                onChange={(checked) => handlePermissionChange(idx, "edit", checked)}
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <div className="flex justify-center">
                              <Checkbox
                                checked={perm.delete}
                                onChange={(checked) =>
                                  handlePermissionChange(idx, "delete", checked)
                                }
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/[0.05]">
              <Button size="sm" variant="outline" onClick={formModal.closeModal}>
                Cancel
              </Button>
              <Button size="sm" type="submit">
                Save
              </Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.closeModal} className="max-w-[450px] m-4">
        <div className="relative w-full rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-error-50 dark:bg-error-500/10 text-error-600 dark:text-error-400 mb-4">
              <FiTrash2 className="size-6" />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
              Delete role
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this role? This action cannot be undone.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Button size="sm" variant="outline" onClick={deleteModal.closeModal} className="w-1/2">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleDeleteConfirm}
              className="w-1/2 bg-error-600 hover:bg-error-750"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
