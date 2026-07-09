import { useState, useMemo } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Badge from "../../../components/ui/badge/Badge";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select";
import { Modal } from "../../../components/ui/modal";
import { useModal } from "../../../hooks/useModal";
import { Dropdown } from "../../../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../../../components/ui/dropdown/DropdownItem";
import { Pagination } from "../../../components/ui/pagination/Pagination";
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

interface Role {
  id: number;
  roleName: string;
  description: string;
  status: "Active" | "Inactive";
}

const initialRoles: Role[] = [
  { id: 1, roleName: "Administrator", description: "Full system access to all modules, records, and configurations.", status: "Active" },
  { id: 2, roleName: "Business Development Manager", description: "Manage BDM team, view pipeline reports, and assign incoming leads.", status: "Active" },
  { id: 3, roleName: "Business Development Executive", description: "Add leads, log customer follow-ups, and coordinate meeting bookings.", status: "Active" },
  { id: 4, roleName: "Presales Consultant", description: "Evaluate lead technical requirements and draft solution proposal details.", status: "Active" },
  { id: 5, roleName: "Guest User", description: "Read-only access to basic performance metric counts on the dashboard.", status: "Inactive" },
];

export default function UserRoleManagement() {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
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

  // Form Fields states
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");
  const [errors, setErrors] = useState<{ roleName?: string; description?: string }>({});

  // Handlers
  const handleOpenView = (role: Role) => {
    setSelectedRole(role);
    viewModal.openModal();
  };

  const handleOpenCreate = () => {
    setModalMode("create");
    setSelectedRole(null);
    setRoleName("");
    setDescription("");
    setStatus("Active");
    setErrors({});
    formModal.openModal();
  };

  const handleOpenEdit = (role: Role) => {
    setModalMode("edit");
    setSelectedRole(role);
    setRoleName(role.roleName);
    setDescription(role.description);
    setStatus(role.status);
    setErrors({});
    formModal.openModal();
  };

  const handleOpenDelete = (role: Role) => {
    setSelectedRole(role);
    deleteModal.openModal();
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!roleName.trim()) {
      newErrors.roleName = "Role name is required";
    } else if (roleName.trim().length < 3) {
      newErrors.roleName = "Role name must be at least 3 characters";
    }
    if (!description.trim()) {
      newErrors.description = "Description is required";
    } else if (description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveRole = () => {
    if (!validateForm()) return;

    if (modalMode === "create") {
      const newId = roles.length > 0 ? Math.max(...roles.map((r) => r.id)) + 1 : 1;
      const newRole: Role = {
        id: newId,
        roleName: roleName.trim(),
        description: description.trim(),
        status,
      };
      setRoles([...roles, newRole]);
    } else if (modalMode === "edit" && selectedRole) {
      setRoles(
        roles.map((r) =>
          r.id === selectedRole.id
            ? { ...r, roleName: roleName.trim(), description: description.trim(), status }
            : r
        )
      );
    }
    formModal.closeModal();
  };

  const handleDeleteConfirm = () => {
    if (selectedRole) {
      setRoles(roles.filter((r) => r.id !== selectedRole.id));
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
          r.description.toLowerCase().includes(q) ||
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
  const renderSortHeader = (label: string, field: keyof Role) => {
    const isActive = sortField === field;
    return (
      <button
        onClick={() => handleSort(field)}
        className="flex items-center gap-1.5 font-medium hover:text-gray-900 dark:hover:text-white cursor-pointer"
      >
        {label}
        <span className="flex flex-col">
          <ChevronUpIcon
            className={`w-3 h-3 -mb-1 transition-colors ${isActive && sortOrder === "asc"
                ? "text-brand-500"
                : "text-gray-300 dark:text-gray-600"
              }`}
          />
          <ChevronDownIcon
            className={`w-3 h-3 transition-colors ${isActive && sortOrder === "desc"
                ? "text-brand-500"
                : "text-gray-300 dark:text-gray-600"
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
              <span>
                {statusFilter === "all" ? "All statuses" : statusFilter}
              </span>
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
                          ? "bg-brand-50 text-brand-500 font-medium dark:bg-brand-500/15 dark:text-brand-400"
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
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  {renderSortHeader("S.No", "id")}
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  {renderSortHeader("Role name", "roleName")}
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  {renderSortHeader("Description", "description")}
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  {renderSortHeader("Status", "status")}
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
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
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-800 dark:text-white/90">
                      {role.id}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-800 dark:text-white/90 font-medium">
                      {role.roleName}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                      {role.description}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                      <Badge
                        size="sm"
                        color={role.status === "Active" ? "success" : "error"}
                      >
                        {role.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2">
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
                    colSpan={5}
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
            <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Role details
            </h4>
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
                <div className="col-span-2">
                  <span className="text-xs text-gray-400 block">Description</span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedRole.description}
                  </p>
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
      <Modal isOpen={formModal.isOpen} onClose={formModal.closeModal} className="max-w-[600px] m-4">
        <div className="relative w-full rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
          <div className="pr-10 border-b border-gray-150 pb-4 mb-4 dark:border-gray-800">
            <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              {modalMode === "create" ? "Add role" : "Edit role"}
            </h4>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Role name <span className="text-error-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Enter role name"
                  value={roleName}
                  onChange={(e) => {
                    setRoleName(e.target.value);
                    if (errors.roleName) setErrors({ ...errors, roleName: undefined });
                  }}
                  className={errors.roleName ? "border-error-500" : ""}
                />
                {errors.roleName && (
                  <span className="mt-1.5 text-xs text-error-600 block">
                    {errors.roleName}
                  </span>
                )}
              </div>

              <div>
                <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status <span className="text-error-500">*</span>
                </label>
                <Select
                  options={[
                    { value: "Active", label: "Active" },
                    { value: "Inactive", label: "Inactive" },
                  ]}
                  placeholder="Select status"
                  defaultValue={status}
                  onChange={(val) => setStatus(val as "Active" | "Inactive")}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description <span className="text-error-500">*</span>
                </label>
                <textarea
                  placeholder="Enter role description"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    if (errors.description) setErrors({ ...errors, description: undefined });
                  }}
                  className={`w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 ${errors.description ? "border-error-500" : ""
                    }`}
                  rows={3}
                />
                {errors.description && (
                  <span className="mt-1.5 text-xs text-error-600 block">
                    {errors.description}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 mt-6">
            <Button size="sm" variant="outline" onClick={formModal.closeModal}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveRole}>
              Save
            </Button>
          </div>
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
            <Button size="sm" onClick={handleDeleteConfirm} className="w-1/2 bg-error-600 hover:bg-error-750">
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
