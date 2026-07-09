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
import { useToast } from "../../../hooks/useToast";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: "Active" | "Inactive";
}

const initialUsers: User[] = [
  { id: 1, name: "John Doe", email: "john.doe@clienzo.com", phone: "+1 234 567 890", role: "Administrator", status: "Active" },
  { id: 2, name: "Jane Smith", email: "jane.smith@clienzo.com", phone: "+1 345 678 901", role: "Business Development Manager", status: "Active" },
  { id: 3, name: "Alice Johnson", email: "alice.johnson@clienzo.com", phone: "+1 456 789 012", role: "Business Development Executive", status: "Active" },
  { id: 4, name: "Robert Lee", email: "robert.lee@clienzo.com", phone: "+1 567 890 123", role: "Presales Consultant", status: "Active" },
  { id: 5, name: "Emma Watson", email: "emma.watson@clienzo.com", phone: "+1 678 901 234", role: "Guest User", status: "Inactive" }
];

const availableRoles = [
  "Administrator",
  "Business Development Manager",
  "Business Development Executive",
  "Presales Consultant",
  "Guest User"
];

export default function UserManagement() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof User>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Dropdown filter open states
  const [isRoleFilterOpen, setIsRoleFilterOpen] = useState(false);
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);

  // Modal control states
  const viewModal = useModal();
  const formModal = useModal();
  const deleteModal = useModal();

  // Active items mappings
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");

  // Form Fields states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState(availableRoles[0]);
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string }>({});

  // Handlers
  const handleOpenView = (user: User) => {
    setSelectedUser(user);
    viewModal.openModal();
  };

  const handleOpenCreate = () => {
    setModalMode("create");
    setSelectedUser(null);
    setName("");
    setEmail("");
    setPhone("");
    setRole(availableRoles[0]);
    setStatus("Active");
    setErrors({});
    formModal.openModal();
  };

  const handleOpenEdit = (user: User) => {
    setModalMode("edit");
    setSelectedUser(user);
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone);
    setRole(user.role);
    setStatus(user.status);
    setErrors({});
    formModal.openModal();
  };

  const handleOpenDelete = (user: User) => {
    setSelectedUser(user);
    deleteModal.openModal();
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) {
      newErrors.name = "Employee name is required";
    } else if (name.trim().length < 3) {
      newErrors.name = "Employee name must be at least 3 characters";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = "Enter a valid email address";
    }

    const digitsOnly = phone.replace(/\D/g, "");
    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (digitsOnly.length < 8) {
      newErrors.phone = "Phone number must be at least 8 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveUser = () => {
    if (!validateForm()) {
      showToast("Please fix the form errors before saving.", "error");
      return;
    }

    if (modalMode === "create") {
      const newId = users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1;
      const newUser: User = {
        id: newId,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role,
        status,
      };
      setUsers([...users, newUser]);
      showToast(`User "${name.trim()}" created successfully.`, "success");
    } else if (modalMode === "edit" && selectedUser) {
      setUsers(
        users.map((u) =>
          u.id === selectedUser.id
            ? { ...u, name: name.trim(), email: email.trim(), phone: phone.trim(), role, status }
            : u
        )
      );
      showToast(`User "${name.trim()}" updated successfully.`, "success");
    }
    formModal.closeModal();
  };

  const handleDeleteConfirm = () => {
    if (selectedUser) {
      setUsers(users.filter((u) => u.id !== selectedUser.id));
      showToast(`User "${selectedUser.name}" deleted successfully.`, "success");
    }
    deleteModal.closeModal();
  };

  // Sorting columns handler
  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  // Role and status options for filters
  const roleFilterOptions = useMemo(() => {
    return [{ value: "all", label: "All roles" }, ...availableRoles.map((r) => ({ value: r, label: r }))];
  }, []);

  const statusFilterOptions = [
    { value: "all", label: "All statuses" },
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
  ];

  // Filters & Sorting calculations
  const processedUsers = useMemo(() => {
    let result = [...users];

    // 1. Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.phone.toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q)
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

    // 4. Sort
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

  // Paginated users
  const paginatedUsers = useMemo(() => {
    const startIdx = (currentPage - 1) * rowsPerPage;
    return processedUsers.slice(startIdx, startIdx + rowsPerPage);
  }, [processedUsers, currentPage, rowsPerPage]);

  const totalItems = processedUsers.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  // Sorting header renderer
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
            className={`w-3 h-3 -mb-1 transition-colors ${
              isActive && sortOrder === "asc"
                ? "text-brand-500"
                : "text-gray-300 dark:text-gray-600"
            }`}
          />
          <ChevronDownIcon
            className={`w-3 h-3 transition-colors ${
              isActive && sortOrder === "desc"
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
        title="User Management | ClienZo"
        description="Manage users in ClienZo CRM."
      />
      {/* Page Title & Breadcrumb */}
      <PageBreadcrumb pageTitle="User Management" />

      {/* Control Panel Area above Table */}
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

          <div className="flex items-center gap-3">
            {/* Custom Dropdown Filter for Role */}
            <div className="relative">
              <button
                onClick={() => setIsRoleFilterOpen(!isRoleFilterOpen)}
                className="flex items-center justify-between h-11 w-44 rounded-lg border border-gray-205 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 cursor-pointer dropdown-toggle hover:bg-gray-50 dark:hover:bg-white/5"
              >
                <span>
                  {roleFilterOptions.find((o) => o.value === roleFilter)?.label || "Filter by role"}
                </span>
                <ChevronDownIcon className="w-4 h-4 text-gray-505" />
              </button>
              <Dropdown
                isOpen={isRoleFilterOpen}
                onClose={() => setIsRoleFilterOpen(false)}
                className="left-0 right-auto w-56 p-1 mt-2"
              >
                <ul className="flex flex-col gap-0.5 max-h-60 overflow-y-auto custom-scrollbar">
                  {roleFilterOptions.map((opt) => (
                    <li key={opt.value}>
                      <DropdownItem
                        onItemClick={() => {
                          setRoleFilter(opt.value);
                          setCurrentPage(1);
                          setIsRoleFilterOpen(false);
                        }}
                        className={`cursor-pointer rounded-lg text-left w-full px-3 py-2 text-sm ${
                          roleFilter === opt.value
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

            {/* Custom Dropdown Filter for Status */}
            <div className="relative">
              <button
                onClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)}
                className="flex items-center justify-between h-11 w-40 rounded-lg border border-gray-205 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 cursor-pointer dropdown-toggle hover:bg-gray-50 dark:hover:bg-white/5"
              >
                <span>
                  {statusFilterOptions.find((o) => o.value === statusFilter)?.label || "Filter by status"}
                </span>
                <ChevronDownIcon className="w-4 h-4 text-gray-505" />
              </button>
              <Dropdown
                isOpen={isStatusFilterOpen}
                onClose={() => setIsStatusFilterOpen(false)}
                className="left-0 right-auto w-40 p-1 mt-2"
              >
                <ul className="flex flex-col gap-0.5">
                  {statusFilterOptions.map((opt) => (
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
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  {renderSortHeader("S.No", "id")}
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  {renderSortHeader("Employee name", "name")}
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  {renderSortHeader("Email", "email")}
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  Phone
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  {renderSortHeader("Role", "role")}
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
                      <Badge
                        size="sm"
                        color={user.status === "Active" ? "success" : "error"}
                      >
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

        {/* Reusable Global Pagination */}
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

      {/* View User Details Modal */}
      <Modal isOpen={viewModal.isOpen} onClose={viewModal.closeModal} className="max-w-[500px] m-4">
        <div className="relative w-full rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
          <div className="pr-10 border-b border-gray-150 pb-4 mb-4 dark:border-gray-800">
            <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              User details
            </h4>
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
                <div>
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
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Employee name <span className="text-error-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Enter employee name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  className={errors.name ? "border-error-500" : ""}
                />
                {errors.name && (
                  <span className="mt-1.5 text-xs text-error-600 block">
                    {errors.name}
                  </span>
                )}
              </div>

              <div>
                <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email address <span className="text-error-500">*</span>
                </label>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  className={errors.email ? "border-error-500" : ""}
                />
                {errors.email && (
                  <span className="mt-1.5 text-xs text-error-600 block">
                    {errors.email}
                  </span>
                )}
              </div>

              <div>
                <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone number <span className="text-error-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (errors.phone) setErrors({ ...errors, phone: undefined });
                  }}
                  className={errors.phone ? "border-error-500" : ""}
                />
                {errors.phone && (
                  <span className="mt-1.5 text-xs text-error-600 block">
                    {errors.phone}
                  </span>
                )}
              </div>

              <div>
                <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Role <span className="text-error-500">*</span>
                </label>
                <Select
                  options={availableRoles.map((r) => ({ value: r, label: r }))}
                  placeholder="Select role"
                  defaultValue={role}
                  onChange={(val) => setRole(val)}
                />
              </div>

              <div className="sm:col-span-2">
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
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 mt-6">
            <Button size="sm" variant="outline" onClick={formModal.closeModal}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveUser}>
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
            <Button size="sm" onClick={handleDeleteConfirm} className="w-1/2 bg-error-600 hover:bg-error-750">
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
