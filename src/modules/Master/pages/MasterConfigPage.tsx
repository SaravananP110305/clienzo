import { useState, useMemo, useEffect } from "react";
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

export interface MasterItem {
  id: number;
  name: string;
  description?: string;
  status: "Active" | "Inactive";
}

interface MasterConfigPageProps {
  pageTitle: string;
  itemNameSingular: string; // e.g. "lead source"
  itemNamePlural: string; // e.g. "lead sources"
  initialData: MasterItem[];
}

export default function MasterConfigPage({
  pageTitle,
  itemNameSingular,
  itemNamePlural,
  initialData,
}: MasterConfigPageProps) {
  const { showToast } = useToast();
  const [items, setItems] = useState<MasterItem[]>(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof MasterItem>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Dropdown filter open states
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);

  // Modal control states
  const viewModal = useModal();
  const formModal = useModal();
  const deleteModal = useModal();

  // Active items mappings
  const [selectedItem, setSelectedItem] = useState<MasterItem | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");

  // Form Fields states
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");
  const [errors, setErrors] = useState<{ name?: string }>({});

  // Reset list if configuration initialData changes (routing changes)
  useEffect(() => {
    setItems(initialData);
    setSearchQuery("");
    setStatusFilter("all");
    setCurrentPage(1);
    setSortField("id");
    setSortOrder("asc");
  }, [initialData]);

  // Handlers
  const handleOpenView = (item: MasterItem) => {
    setSelectedItem(item);
    viewModal.openModal();
  };

  const handleOpenCreate = () => {
    setModalMode("create");
    setSelectedItem(null);
    setName("");
    setStatus("Active");
    setErrors({});
    formModal.openModal();
  };

  const handleOpenEdit = (item: MasterItem) => {
    setModalMode("edit");
    setSelectedItem(item);
    setName(item.name);
    setStatus(item.status);
    setErrors({});
    formModal.openModal();
  };

  const handleOpenDelete = (item: MasterItem) => {
    setSelectedItem(item);
    deleteModal.openModal();
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) {
      newErrors.name = `Name is required`;
    } else if (name.trim().length < 3) {
      newErrors.name = `Name must be at least 3 characters`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveItem = () => {
    if (!validateForm()) {
      showToast(`Please fix the form errors before saving.`, "error");
      return;
    }

    if (modalMode === "create") {
      const newId = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
      const newItem: MasterItem = {
        id: newId,
        name: name.trim(),
        status,
      };
      setItems([...items, newItem]);
      showToast(`"${name.trim()}" ${itemNameSingular} created successfully.`, "success");
    } else if (modalMode === "edit" && selectedItem) {
      setItems(
        items.map((i) =>
          i.id === selectedItem.id
            ? { ...i, name: name.trim(), status }
            : i
        )
      );
      showToast(`"${name.trim()}" ${itemNameSingular} updated successfully.`, "success");
    }
    formModal.closeModal();
  };

  const handleDeleteConfirm = () => {
    if (selectedItem) {
      setItems(items.filter((i) => i.id !== selectedItem.id));
      showToast(`"${selectedItem.name}" ${itemNameSingular} deleted successfully.`, "success");
    }
    deleteModal.closeModal();
  };

  // Sorting columns handler
  const handleSort = (field: keyof MasterItem) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  // Filters & Sorting calculations
  const processedItems = useMemo(() => {
    let result = [...items];

    // 1. Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q)
      );
    }

    // 2. Status filter
    if (statusFilter !== "all") {
      result = result.filter((i) => i.status === statusFilter);
    }

    // 3. Sort
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
  }, [items, searchQuery, statusFilter, sortField, sortOrder]);

  // Paginated items
  const paginatedItems = useMemo(() => {
    const startIdx = (currentPage - 1) * rowsPerPage;
    return processedItems.slice(startIdx, startIdx + rowsPerPage);
  }, [processedItems, currentPage, rowsPerPage]);

  const totalItems = processedItems.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  // Sorting header renderer
  const renderSortHeader = (label: string, field: keyof MasterItem, centered = false) => {
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
        title={`${pageTitle} | ClienZo`}
        description="Manage configuration settings in ClienZo CRM."
      />
      {/* Page Title & Breadcrumb */}
      <PageBreadcrumb pageTitle={pageTitle} />

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

          {/* Custom Dropdown Filter for Status */}
          <div className="relative">
            <button
              onClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)}
              className="flex items-center justify-between h-11 w-40 rounded-lg border border-gray-205 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 cursor-pointer dropdown-toggle hover:bg-gray-50 dark:hover:bg-white/5"
            >
              <span>
                {statusFilter === "all" ? "All statuses" : statusFilter}
              </span>
              <ChevronDownIcon className="w-4 h-4 text-gray-505" />
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
            Add {itemNameSingular}
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] sticky top-0 bg-white dark:bg-gray-900 z-10">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-center text-theme-xs font-medium text-gray-500 dark:text-gray-400 w-[100px]">
                  {renderSortHeader("S.No", "id", true)}
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                  {renderSortHeader("Name", "name")}
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-center text-theme-xs font-medium text-gray-500 dark:text-gray-400 w-[180px]">
                  {renderSortHeader("Status", "status", true)}
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-center text-theme-xs font-medium text-gray-500 dark:text-gray-400 w-[180px]">
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {paginatedItems.length > 0 ? (
                paginatedItems.map((item) => (
                  <TableRow
                    key={item.id}
                    className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-800 dark:text-white/90 text-center">
                      {item.id}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-800 dark:text-white/90 font-medium">
                      {item.name}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400 text-center">
                      <Badge
                        size="sm"
                        color={item.status === "Active" ? "success" : "error"}
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenView(item)}
                          className="p-1.5 text-gray-500 hover:text-brand-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition cursor-pointer"
                          title="View"
                        >
                          <FiEye className="size-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-gray-500 hover:text-brand-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition cursor-pointer"
                          title="Edit"
                        >
                          <FiEdit className="size-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(item)}
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
                    No items found matching search criteria.
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
            itemName={itemNamePlural}
          />
        )}
      </div>

      {/* View Item Details Modal */}
      <Modal isOpen={viewModal.isOpen} onClose={viewModal.closeModal} className="max-w-[500px] m-4">
        <div className="relative w-full rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
          <div className="pr-10 border-b border-gray-150 pb-4 mb-4 dark:border-gray-800">
            <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              {itemNameSingular} details
            </h4>
          </div>
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-gray-400 block">S.No</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {selectedItem.id}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block">Status</span>
                  <div className="mt-1">
                    <Badge
                      size="sm"
                      color={selectedItem.status === "Active" ? "success" : "error"}
                    >
                      {selectedItem.status}
                    </Badge>
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-gray-400 block">Name</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {selectedItem.name}
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
      <Modal isOpen={formModal.isOpen} onClose={formModal.closeModal} className="max-w-[500px] m-4">
        <div className="relative w-full rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
          <div className="pr-10 border-b border-gray-150 pb-4 mb-4 dark:border-gray-800">
            <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              {modalMode === "create" ? `Add ${itemNameSingular}` : `Edit ${itemNameSingular}`}
            </h4>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-2.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Name <span className="text-error-500">*</span>
              </label>
              <Input
                type="text"
                placeholder={`Enter name`}
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                className={errors.name ? "border-error-500" : ""}
              />
              {errors.name && (
                <span className="mt-1.5 text-xs text-error-600 block font-normal">
                  {errors.name}
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
          </div>
          <div className="flex items-center justify-end gap-3 mt-6">
            <Button size="sm" variant="outline" onClick={formModal.closeModal}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveItem}>
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
              Delete {itemNameSingular}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this {itemNameSingular}? This action cannot be undone.
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
