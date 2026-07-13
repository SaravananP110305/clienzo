import { useState, useMemo } from "react";
import { getStorage, setStorage } from "../../../utils/storage";
import { useForm, Controller } from "react-hook-form";
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

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: "Active" | "Inactive";
  password?: string;
}

const initialUsers: User[] = [
  { id: 1, name: "John Doe", email: "john.doe@saiflow.com", phone: "+91 98765 43210", role: "Administrator", status: "Active", password: "Password@123" },
  { id: 2, name: "Jane Smith", email: "jane.smith@saiflow.com", phone: "+91 98765 43211", role: "Business Development Manager", status: "Active", password: "Password@123" },
  { id: 3, name: "Alice Johnson", email: "alice.johnson@saiflow.com", phone: "+91 98765 43212", role: "Business Development Executive", status: "Active", password: "Password@123" },
  { id: 4, name: "Robert Lee", email: "robert.lee@saiflow.com", phone: "+91 98765 43213", role: "Presales Consultant", status: "Active", password: "Password@123" },
  { id: 5, name: "Emma Watson", email: "emma.watson@saiflow.com", phone: "+91 98765 43214", role: "Guest User", status: "Inactive", password: "Password@123" }
];

const availableRoles = [
  "Administrator",
  "Business Development Manager",
  "Business Development Executive",
  "Presales Consultant",
  "Guest User"
];

interface UserFormValues {
  name: string;
  email: string;
  phone: string;
  role: string;
  status: "Active" | "Inactive";
  password?: string;
}

export default function UserManagement() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>(() => getStorage("saiflow_users", initialUsers));
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof User>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Dropdown states
  const [isRoleFilterOpen, setIsRoleFilterOpen] = useState(false);
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);

  // Modal states
  const viewModal = useModal();
  const formModal = useModal();
  const deleteModal = useModal();

  // Active items mapping
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [showPassword, setShowPassword] = useState(false);

  // React Hook Form
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "",
      status: "Active",
      password: "",
    },
  });

  // Handlers
  const handleOpenView = (user: User) => {
    setSelectedUser(user);
    viewModal.openModal();
  };

  const handleOpenCreate = () => {
    setModalMode("create");
    setSelectedUser(null);
    setShowPassword(false);
    reset({
      name: "",
      email: "",
      phone: "",
      role: "",
      status: "Active",
      password: "",
    });
    formModal.openModal();
  };

  const handleOpenEdit = (user: User) => {
    setModalMode("edit");
    setSelectedUser(user);
    setShowPassword(false);
    reset({
      name: user.name,
      email: user.email,
      phone: user.phone.replace(/\D/g, "").slice(-10),
      role: user.role,
      status: user.status,
      password: user.password || "",
    });
    formModal.openModal();
  };

  const handleOpenDelete = (user: User) => {
    setSelectedUser(user);
    deleteModal.openModal();
  };

  const handleSaveUser = (data: UserFormValues) => {
    if (modalMode === "create") {
      const newId = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;
      const newUser: User = {
        id: newId,
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        role: data.role,
        status: data.status,
        password: data.password?.trim() || "Password@123",
      };
      const updated = [...users, newUser];
      setUsers(updated);
      setStorage("saiflow_users", updated);
      showToast("User created successfully.", "success");
    } else if (modalMode === "edit" && selectedUser) {
      const updated = users.map((u) =>
        u.id === selectedUser.id
          ? {
            ...u,
            name: data.name.trim(),
            email: data.email.trim(),
            phone: data.phone.trim(),
            role: data.role,
            status: data.status,
            password: data.password?.trim() || u.password,
          }
          : u
      );
      setUsers(updated);
      setStorage("saiflow_users", updated);
      showToast("User updated successfully.", "success");
    }
    formModal.closeModal();
  };

  const handleFormError = () => {
    showToast("Please fill all required fields.", "error");
  };

  const handleDeleteConfirm = () => {
    if (selectedUser) {
      const updated = users.filter((u) => u.id !== selectedUser.id);
      setUsers(updated);
      setStorage("saiflow_users", updated);
      showToast("User deleted successfully.", "success");
    }
    deleteModal.closeModal();
  };

  // Sorting columns
  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  // Filters & Sorting calculations
  const processedUsers = useMemo(() => {
    let result = [...users];

    // 1. Search Query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.phone.toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q) ||
          u.status.toLowerCase().includes(q)
      );
    }

    // 2. Role filter
    if (roleFilter !== "all") {
      result = result.filter((u) => u.role === roleFilter);
    }

    // 3. Status filter
    if (statusFilter !== "all") {
      result = result.filter((u) => u.status === statusFilter);
    }

    // 4. Sort column values
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
  }, [users, searchQuery, roleFilter, statusFilter, sortField, sortOrder]);

  // Paginated elements calculation
  const paginatedUsers = useMemo(() => {
    const startIdx = (currentPage - 1) * rowsPerPage;
    return processedUsers.slice(startIdx, startIdx + rowsPerPage);
  }, [processedUsers, currentPage, rowsPerPage]);

  const totalItems = processedUsers.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  // Sorting header icons indicator renderer
  const renderSortHeader = (label: string, field: keyof User) => {
    const isActive = sortField === field;
    return (
      <button
        onClick={() => handleSort(field)}
        className="flex items-center gap-1.5 font-medium hover:text-gray-900 dark:hover:text-white cursor-pointer"
      >
        {label}
        <span className="flex flex-col">
          <ChevronUpIcon
            className={`w-3 h-3 -mb-1 transition-colors ${isActive && sortOrder === "asc" ? "text-brand-500" : "text-gray-300 dark:text-gray-600"
              }`}
          />
          <ChevronDownIcon
            className={`w-3 h-3 transition-colors ${isActive && sortOrder === "desc" ? "text-brand-500" : "text-gray-300 dark:text-gray-600"
              }`}
          />
        </span>
      </button>
    );
  };

  return (
    <>
      <PageMeta
        title="Manage Users | SaiFlow"
        description="Manage employee accounts and roles in SaiFlow CRM."
      />
      {/* Page Title & Breadcrumb */}
      <PageBreadcrumb pageTitle="Manage Users" />

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

          {/* Custom Dropdown Filter for Role */}
          <div className="relative">
            <button
              onClick={() => setIsRoleFilterOpen(!isRoleFilterOpen)}
              className="flex items-center justify-between h-11 w-48 rounded-lg border border-gray-205 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 cursor-pointer dropdown-toggle hover:bg-gray-50 dark:hover:bg-white/5"
            >
              <span>{roleFilter === "all" ? "All roles" : roleFilter}</span>
              <ChevronDownIcon className="w-4 h-4 text-gray-555" />
            </button>
            <Dropdown
              isOpen={isRoleFilterOpen}
              onClose={() => setIsRoleFilterOpen(false)}
              className="left-0 right-auto w-48 p-1 mt-2"
            >
              <ul className="flex flex-col gap-0.5">
                <li>
                  <DropdownItem
                    onItemClick={() => {
                      setRoleFilter("all");
                      setCurrentPage(1);
                      setIsRoleFilterOpen(false);
                    }}
                    className={`cursor-pointer rounded-lg text-left w-full px-3 py-2 text-sm ${roleFilter === "all"
                        ? "bg-brand-500 text-white font-medium"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
                      }`}
                  >
                    All roles
                  </DropdownItem>
                </li>
                {availableRoles.map((roleOpt) => (
                  <li key={roleOpt}>
                    <DropdownItem
                      onItemClick={() => {
                        setRoleFilter(roleOpt);
                        setCurrentPage(1);
                        setIsRoleFilterOpen(false);
                      }}
                      className={`cursor-pointer rounded-lg text-left w-full px-3 py-2 text-sm ${roleFilter === roleOpt
                          ? "bg-brand-500 text-white font-medium"
                          : "text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
                        }`}
                    >
                      {roleOpt}
                    </DropdownItem>
                  </li>
                ))}
              </ul>
            </Dropdown>
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
                      className={`cursor-pointer rounded-lg text-left w-full px-3 py-2 text-sm ${statusFilter === opt.value
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
            Add user
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
                  className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  {renderSortHeader("S.No", "id")}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  {renderSortHeader("Employee name", "name")}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  {renderSortHeader("Email address", "email")}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  {renderSortHeader("Phone", "phone")}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  {renderSortHeader("Role", "role")}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  {renderSortHeader("Status", "status")}
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-800 dark:text-white/90">
                      {user.id}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-800 dark:text-white/90 font-medium">
                      {user.name}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                      {user.phone}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                      {user.role}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                      <Badge size="sm" color={user.status === "Active" ? "success" : "error"}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenView(user)}
                          className="p-1.5 text-gray-500 hover:text-brand-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition cursor-pointer"
                          title="View"
                        >
                          <FiEye className="size-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-1.5 text-gray-500 hover:text-brand-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition cursor-pointer"
                          title="Edit"
                        >
                          <FiEdit className="size-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(user)}
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
                    colSpan={7}
                    className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No users match your search criteria.
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
            itemName="users"
          />
        )}
      </div>

      {/* View User Modal (Read-Only details) */}
      <Modal isOpen={viewModal.isOpen} onClose={viewModal.closeModal} className="max-w-[500px] m-4">
        <div className="relative w-full rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
          <div className="pr-10 border-b border-gray-150 pb-4 mb-4 dark:border-gray-800">
            <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">User details</h4>
          </div>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-gray-400 block">S.No</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {selectedUser.id}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Status</span>
                  <div className="mt-1">
                    <Badge
                      size="sm"
                      color={selectedUser.status === "Active" ? "success" : "error"}
                    >
                      {selectedUser.status}
                    </Badge>
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-gray-400 block">Employee name</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {selectedUser.name}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Role</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {selectedUser.role}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Email</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {selectedUser.email}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Phone</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {selectedUser.phone}
                  </span>
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

      {/* Create / Edit Form Modal */}
      <Modal isOpen={formModal.isOpen} onClose={formModal.closeModal} className="max-w-[650px] m-4">
        <div className="relative w-full rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
          <div className="pr-10 border-b border-gray-150 pb-4 mb-4 dark:border-gray-800">
            <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              {modalMode === "create" ? "Add user" : "Edit user"}
            </h4>
          </div>
          <form onSubmit={handleSubmit(handleSaveUser, handleFormError)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Employee name <span className="text-error-500">*</span>
                </label>
                <Controller
                  name="name"
                  control={control}
                  rules={{
                    required: "Name is required",
                    pattern: {
                      value: /^[a-zA-Z\s]+$/,
                      message: "Letters and spaces only",
                    },
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      placeholder="Enter employee name"
                      className={errors.name ? "border-error-500" : ""}
                    />
                  )}
                />
                {errors.name && (
                  <span className="mt-1.5 text-xs text-error-600 block">{errors.name.message}</span>
                )}
              </div>

              <div>
                <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Role <span className="text-error-500">*</span>
                </label>
                <Controller
                  name="role"
                  control={control}
                  rules={{ required: "Role is required" }}
                  render={({ field: { value, onChange } }) => (
                    <Select
                      options={availableRoles.map((r) => ({ value: r, label: r }))}
                      placeholder="Select role"
                      defaultValue={value}
                      onChange={onChange}
                    />
                  )}
                />
                {errors.role && (
                  <span className="mt-1.5 text-xs text-error-600 block">{errors.role.message}</span>
                )}
              </div>

              <div>
                <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email address <span className="text-error-500">*</span>
                </label>
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: "Email is required",
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: "Please enter a valid email address.",
                    },
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="email"
                      placeholder="Enter email address"
                      className={errors.email ? "border-error-500" : ""}
                    />
                  )}
                />
                {errors.email && (
                  <span className="mt-1.5 text-xs text-error-600 block">{errors.email.message}</span>
                )}
              </div>

              {modalMode === "create" && (
                <div>
                  <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Password <span className="text-error-500">*</span>
                  </label>
                  <Controller
                    name="password"
                    control={control}
                    rules={{
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters long",
                      },
                    }}
                    render={({ field }) => (
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter password"
                          className={errors.password ? "border-error-500 pr-10" : "pr-10"}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none cursor-pointer"
                        >
                          {showPassword ? <FiEye className="size-5" /> : <FiEye className="size-5 opacity-60" />}
                        </button>
                      </div>
                    )}
                  />
                  {errors.password && (
                    <span className="mt-1.5 text-xs text-error-600 block">{errors.password.message}</span>
                  )}
                </div>
              )}

              <div>
                <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone number <span className="text-error-500">*</span>
                </label>
                <Controller
                  name="phone"
                  control={control}
                  rules={{
                    required: "Phone number is required",
                    pattern: {
                      value: /^[6-9]\d{9}$/,
                      message: "Please enter a valid 10-digit mobile number starting with 6-9.",
                    },
                  }}
                  render={({ field: { value, onChange, ...rest } }) => (
                    <Input
                      {...rest}
                      value={value}
                      type="text"
                      placeholder="Enter 10-digit phone number"
                      maxLength={10}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "");
                        onChange(digits);
                      }}
                      className={errors.phone ? "border-error-500" : ""}
                    />
                  )}
                />
                {errors.phone && (
                  <span className="mt-1.5 text-xs text-error-600 block">{errors.phone.message}</span>
                )}
              </div>

              <div>
                <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Status <span className="text-error-500">*</span>
                </label>
                <Controller
                  name="status"
                  control={control}
                  rules={{ required: "Status is required" }}
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
                {errors.status && (
                  <span className="mt-1.5 text-xs text-error-600 block">{errors.status.message}</span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-white/[0.05]">
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
              Delete user
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this user? This action cannot be undone.
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
