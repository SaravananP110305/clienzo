import { useState, useMemo } from "react";
import { getStorage, setStorage } from "../../../utils/storage";
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
import { ChevronDownIcon, ChevronUpIcon } from "../../../icons";
import { FiEye, FiEdit, FiTrash2, FiPlus } from "react-icons/fi";
import { useToast } from "../../../hooks/useToast";
import { initialQuotations, Quotation } from "../data/quotationsData";

export default function QuotationList() {
  const { showToast } = useToast();
  const [quotations, setQuotations] = useState<Quotation[]>(() =>
    getStorage("saiflow_quotations", initialQuotations)
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Quotation>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Dropdown states
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);

  // Modal states
  const formModal = useModal();
  const deleteModal = useModal();
  const viewModal = useModal();

  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");

  // Form Fields states
  const [client, setClient] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<Quotation["status"]>("Draft");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleOpenCreate = () => {
    setModalMode("create");
    setSelectedQuotation(null);
    setClient("");
    setCategory("");
    setAmount("");
    setStatus("Draft");
    setErrors({});
    formModal.openModal();
  };

  const handleOpenEdit = (quote: Quotation) => {
    setModalMode("edit");
    setSelectedQuotation(quote);
    setClient(quote.client);
    setCategory(quote.category);
    setAmount(String(quote.amount));
    setStatus(quote.status);
    setErrors({});
    formModal.openModal();
  };

  const handleOpenView = (quote: Quotation) => {
    setSelectedQuotation(quote);
    viewModal.openModal();
  };

  const handleOpenDelete = (quote: Quotation) => {
    setSelectedQuotation(quote);
    deleteModal.openModal();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!client.trim()) newErrors.client = "Client is required.";
    if (!category.trim()) newErrors.category = "Category is required.";
    if (!amount.trim() || isNaN(Number(amount))) newErrors.amount = "A valid numeric amount is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast("Please fill all required fields correctly.", "error");
      return;
    }

    if (modalMode === "create") {
      const qNo = `QT-2026-0${quotations.length + 1}`;
      const newQuote: Quotation = {
        id: quotations.length > 0 ? Math.max(...quotations.map((q) => q.id)) + 1 : 1,
        quotationNo: qNo,
        client: client.trim(),
        category: category.trim(),
        amount: Number(amount),
        status,
        date: new Date().toISOString().split("T")[0],
      };
      const updated = [...quotations, newQuote];
      setQuotations(updated);
      setStorage("saiflow_quotations", updated);
      showToast("Quotation created successfully.", "success");
    } else if (modalMode === "edit" && selectedQuotation) {
      const updated = quotations.map((q) =>
        q.id === selectedQuotation.id
          ? {
              ...q,
              client: client.trim(),
              category: category.trim(),
              amount: Number(amount),
              status,
            }
          : q
      );
      setQuotations(updated);
      setStorage("saiflow_quotations", updated);
      showToast("Quotation updated.", "success");
    }
    formModal.closeModal();
  };

  const handleDeleteConfirm = () => {
    if (selectedQuotation) {
      const updated = quotations.filter((q) => q.id !== selectedQuotation.id);
      setQuotations(updated);
      setStorage("saiflow_quotations", updated);
      showToast("Quotation deleted successfully.", "success");
    }
    deleteModal.closeModal();
  };

  // Processing
  const processedQuotations = useMemo(() => {
    let result = [...quotations];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (q) =>
          q.quotationNo.toLowerCase().includes(query) ||
          q.client.toLowerCase().includes(query) ||
          q.category.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((q) => q.status === statusFilter);
    }

    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortOrder === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

    return result;
  }, [quotations, searchQuery, statusFilter, sortField, sortOrder]);

  const paginatedQuotations = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return processedQuotations.slice(start, start + rowsPerPage);
  }, [processedQuotations, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(processedQuotations.length / rowsPerPage);

  const getStatusColor = (s: Quotation["status"]) => {
    switch (s) {
      case "Draft":
        return "light";
      case "Sent":
        return "warning";
      case "Approved":
        return "success";
      case "Declined":
        return "error";
      default:
        return "light";
    }
  };

  const handleSort = (field: keyof Quotation) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  return (
    <>
      <PageMeta
        title="Quotation Management | SaiFlow"
        description="Create and track pricing quotations for prospective projects in SaiFlow."
      />
      <PageBreadcrumb pageTitle="Quotation Management" />

      <div className="flex flex-col gap-4 mb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center w-full lg:w-auto">
          <div className="w-full sm:w-64">
            <Input
              type="text"
              placeholder="Search quotes..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)}
              className="flex items-center justify-between h-11 w-44 rounded-lg border border-gray-200 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 cursor-pointer dropdown-toggle hover:bg-gray-50 dark:hover:bg-white/5"
            >
              <span className="truncate text-left flex-1">{statusFilter === "all" ? "All Statuses" : statusFilter}</span>
              <ChevronDownIcon className="w-4 h-4 text-gray-500 shrink-0 ml-2" />
            </button>
            <Dropdown
              isOpen={isStatusFilterOpen}
              onClose={() => setIsStatusFilterOpen(false)}
              className="left-0 w-40 p-1 mt-2"
            >
              <ul className="flex flex-col gap-0.5">
                <li>
                  <DropdownItem
                    onItemClick={() => {
                      setStatusFilter("all");
                      setCurrentPage(1);
                      setIsStatusFilterOpen(false);
                    }}
                    className={`cursor-pointer rounded-lg text-left w-full px-3 py-2 text-sm ${
                      statusFilter === "all" ? "bg-brand-500 text-white" : "text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
                    }`}
                  >
                    All Statuses
                  </DropdownItem>
                </li>
                {["Draft", "Sent", "Approved", "Declined"].map((st) => (
                  <li key={st}>
                    <DropdownItem
                      onItemClick={() => {
                        setStatusFilter(st);
                        setCurrentPage(1);
                        setIsStatusFilterOpen(false);
                      }}
                      className={`cursor-pointer rounded-lg text-left w-full px-3 py-2 text-sm ${
                        statusFilter === st ? "bg-brand-500 text-white" : "text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
                      }`}
                    >
                      {st}
                    </DropdownItem>
                  </li>
                ))}
              </ul>
            </Dropdown>
          </div>
        </div>
        <Button onClick={handleOpenCreate} variant="primary" size="sm" startIcon={<FiPlus />}>
          Create Quotation
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] sticky top-0 bg-white dark:bg-gray-900 z-10">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  <button onClick={() => handleSort("quotationNo")} className="flex items-center gap-1.5 font-medium hover:text-gray-900 dark:hover:text-white cursor-pointer">
                    Quotation No
                    <span className="flex flex-col">
                      <ChevronUpIcon className={`w-3 h-3 -mb-1 transition-colors ${sortField === "quotationNo" && sortOrder === "asc" ? "text-brand-500" : "text-gray-300 dark:text-gray-600"}`} />
                      <ChevronDownIcon className={`w-3 h-3 transition-colors ${sortField === "quotationNo" && sortOrder === "desc" ? "text-brand-500" : "text-gray-300 dark:text-gray-600"}`} />
                    </span>
                  </button>
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Client</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Project Category</TableCell>
                <TableCell isHeader className="px-5 py-3 text-end text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Amount</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Status</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Creation Date</TableCell>
                <TableCell isHeader className="px-5 py-3 text-end text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {paginatedQuotations.length > 0 ? (
                paginatedQuotations.map((quote) => (
                  <TableRow key={quote.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                    <TableCell className="px-5 py-4 text-theme-sm font-medium text-gray-800 dark:text-white/90">{quote.quotationNo}</TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-600 dark:text-gray-400">{quote.client}</TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-600 dark:text-gray-400">{quote.category}</TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-800 dark:text-white/90 text-end font-medium">
                      ${quote.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm whitespace-nowrap">
                      <Badge size="sm" color={getStatusColor(quote.status)}>{quote.status}</Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-600 dark:text-gray-400">{quote.date}</TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm text-end">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenView(quote)} className="p-1.5 text-gray-500 hover:text-brand-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition cursor-pointer" title="View"><FiEye className="size-4" /></button>
                        <button onClick={() => handleOpenEdit(quote)} className="p-1.5 text-gray-500 hover:text-brand-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition cursor-pointer" title="Edit"><FiEdit className="size-4" /></button>
                        <button onClick={() => handleOpenDelete(quote)} className="p-1.5 text-gray-500 hover:text-error-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition cursor-pointer" title="Delete"><FiTrash2 className="size-4" /></button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No quotations found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {processedQuotations.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={processedQuotations.length}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={(rows) => {
            setRowsPerPage(rows);
            setCurrentPage(1);
          }}
          itemName="items"
        />
      )}

      {/* Form Modal */}
      <Modal isOpen={formModal.isOpen} onClose={formModal.closeModal} className="max-w-lg p-6">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          {modalMode === "create" ? "Create Quotation" : "Edit Quotation"}
        </h4>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Client Name *</label>
            <Input type="text" placeholder="e.g. Aventis Technologies" value={client} onChange={(e) => setClient(e.target.value)} error={!!errors.client} hint={errors.client} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Project Category *</label>
            <Input type="text" placeholder="e.g. Web ERP Platform Development" value={category} onChange={(e) => setCategory(e.target.value)} error={!!errors.category} hint={errors.category} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Amount ($) *</label>
            <Input type="number" placeholder="45000" value={amount} onChange={(e) => setAmount(e.target.value)} error={!!errors.amount} hint={errors.amount} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Status</label>
            <Select
              options={[
                { value: "Draft", label: "Draft" },
                { value: "Sent", label: "Sent" },
                { value: "Approved", label: "Approved" },
                { value: "Declined", label: "Declined" },
              ]}
              defaultValue={status}
              onChange={(val) => setStatus(val as any)}
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={formModal.closeModal} variant="outline" size="sm">Cancel</Button>
            <Button type="submit" variant="primary" size="sm">Save Quote</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.closeModal} className="max-w-md p-6">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">Delete Quotation</h4>
        <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete quotation "{selectedQuotation?.quotationNo}"? This action cannot be undone.</p>
        <div className="flex justify-end gap-3">
          <Button onClick={deleteModal.closeModal} variant="outline" size="sm">Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="primary" className="bg-error-600 hover:bg-error-700 border-error-600 text-white" size="sm">Delete</Button>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={viewModal.isOpen} onClose={viewModal.closeModal} className="max-w-md p-6">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Quotation Details</h4>
        {selectedQuotation && (
          <div className="space-y-3">
            <div className="flex justify-between border-b pb-2 dark:border-white/[0.05]"><span className="text-sm font-medium text-gray-500">Quotation No</span><span className="text-sm text-gray-800 dark:text-white font-semibold">{selectedQuotation.quotationNo}</span></div>
            <div className="flex justify-between border-b pb-2 dark:border-white/[0.05]"><span className="text-sm font-medium text-gray-500">Client</span><span className="text-sm text-gray-800 dark:text-white">{selectedQuotation.client}</span></div>
            <div className="flex justify-between border-b pb-2 dark:border-white/[0.05]"><span className="text-sm font-medium text-gray-500">Project Category</span><span className="text-sm text-gray-800 dark:text-white">{selectedQuotation.category}</span></div>
            <div className="flex justify-between border-b pb-2 dark:border-white/[0.05]"><span className="text-sm font-medium text-gray-500">Amount</span><span className="text-sm text-gray-800 dark:text-white font-semibold">${selectedQuotation.amount.toLocaleString()}</span></div>
            <div className="flex justify-between border-b pb-2 dark:border-white/[0.05]"><span className="text-sm font-medium text-gray-500">Status</span><Badge color={getStatusColor(selectedQuotation.status)} variant="solid">{selectedQuotation.status}</Badge></div>
            <div className="flex justify-between pb-2"><span className="text-sm font-medium text-gray-500">Date Created</span><span className="text-sm text-gray-800 dark:text-white">{selectedQuotation.date}</span></div>
          </div>
        )}
        <div className="flex justify-end mt-6">
          <Button onClick={viewModal.closeModal} variant="outline" size="sm">Close</Button>
        </div>
      </Modal>
    </>
  );
}
