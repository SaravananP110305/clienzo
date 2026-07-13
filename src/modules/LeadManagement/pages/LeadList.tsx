import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Badge from "../../../components/ui/badge/Badge";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
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
import { FiEye, FiEdit, FiTrash2, FiPlus, FiUpload } from "react-icons/fi";
import { useToast } from "../../../hooks/useToast";
import { getStorage, setStorage } from "../../../utils/storage";
import * as XLSX from "xlsx";
import {
  initialLeads,
  getStatusColor,
  getPriorityColor,
  LEAD_STATUSES,
  LEAD_PRIORITIES,
  ASSIGNEES,
  type Lead,
  type LeadPriority,
} from "../data/leadsData";
import { LEAD_SOURCES, INDUSTRIES } from "../../Master/data/masterData";

export default function LeadList() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const uploadModal = useModal();
  const deleteModal = useModal();

  const loggedInUser = getStorage<any>("clienzo_logged_in_user", null);
  const isAdmin = loggedInUser?.role === "Administrator";

  useEffect(() => {
    if (isAdmin) {
      navigate("/dashboard");
    }
  }, [isAdmin, navigate]);

  const [leads, setLeads] = useState<Lead[]>(() => {
    const list = getStorage<Lead[]>("clienzo_leads", initialLeads);
    // Auto-clean any corrupt binary rows loaded previously from excel upload attempt
    const cleaned = list.filter(
      (l) =>
        l.company &&
        !l.company.includes("[Content_Types]") &&
        !l.company.includes("xml") &&
        !l.company.includes("xl/") &&
        !l.email.includes("xml")
    );
    if (cleaned.length !== list.length) {
      setStorage("clienzo_leads", cleaned);
    }
    return cleaned;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Lead>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  const [selectedLeadIds, setSelectedLeadIds] = useState<number[]>([]);
  const [industryFilter, setIndustryFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [isIndustryOpen, setIsIndustryOpen] = useState(false);
  const [isSourceOpen, setIsSourceOpen] = useState(false);

  const handleBulkAssign = (assignee: string) => {
    const updated = leads.map((l) =>
      selectedLeadIds.includes(l.id) ? { ...l, assignedTo: assignee } : l
    );
    setLeads(updated);
    setStorage("clienzo_leads", updated);
    setSelectedLeadIds([]);
    showToast(`Successfully assigned selected leads to ${assignee}.`, "success");
  };

  const handleBulkDelete = () => {
    const updated = leads.filter((l) => !selectedLeadIds.includes(l.id));
    setLeads(updated);
    setStorage("clienzo_leads", updated);
    setSelectedLeadIds([]);
    showToast("Successfully deleted selected leads.", "success");
  };

  // Filter dropdown open states
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isAssigneeOpen, setIsAssigneeOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);

  // Upload dialog state
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleOpenDelete = (lead: Lead) => {
    setSelectedLead(lead);
    deleteModal.openModal();
  };

  const handleDeleteConfirm = () => {
    if (selectedLead) {
      const updated = leads.filter((l) => l.id !== selectedLead.id);
      setLeads(updated);
      setStorage("clienzo_leads", updated);
      showToast(`Lead "${selectedLead.company}" deleted successfully.`, "success");
    }
    deleteModal.closeModal();
  };

  const handleDirectAssign = (leadId: number, newAssignee: string) => {
    const updated = leads.map((l) =>
      l.id === leadId ? { ...l, assignedTo: newAssignee } : l
    );
    setLeads(updated);
    setStorage("clienzo_leads", updated);
    showToast(`Lead assigned to ${newAssignee} successfully.`, "success");
  };

  const downloadSampleTemplate = () => {
    const sampleData = [
      {
        "Company": "Google LLC",
        "Contact Person": "Larry Page",
        "Email": "larry@google.com",
        "Phone": "9876543210",
        "Status": "New",
        "Priority": "High",
        "Assigned To": ASSIGNEES[0] || "John Doe",
      },
      {
        "Company": "Microsoft Corp",
        "Contact Person": "Bill Gates",
        "Email": "bill@microsoft.com",
        "Phone": "9876543211",
        "Status": "Contacted",
        "Priority": "Medium",
        "Assigned To": ASSIGNEES[1] || "Jane Smith",
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leads Template");
    XLSX.writeFile(workbook, "clienzo_leads_sample_template.xlsx");
    showToast("Sample Excel template downloaded successfully.", "success");
  };

  const handleSort = (field: keyof Lead) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const statusOptions = [
    { value: "all", label: "All statuses" },
    ...LEAD_STATUSES.map((s) => ({ value: s, label: s })),
  ];

  const assigneeOptions = [
    { value: "all", label: "All assignees" },
    ...ASSIGNEES.map((a) => ({ value: a, label: a })),
  ];

  const priorityOptions = [
    { value: "all", label: "All priorities" },
    ...LEAD_PRIORITIES.map((p) => ({ value: p, label: p })),
  ];

  const industryOptions = [
    { value: "all", label: "All industries" },
    ...getStorage("clienzo_master_industries", INDUSTRIES).filter((i: any) => i.status === "Active").map((i: any) => ({ value: i.name, label: i.name }))
  ];

  const sourceOptions = [
    { value: "all", label: "All sources" },
    ...getStorage("clienzo_master_lead_sources", LEAD_SOURCES).filter((s: any) => s.status === "Active").map((s: any) => ({ value: s.name, label: s.name }))
  ];

  const processedLeads = useMemo(() => {
    let result = [...leads];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.company.toLowerCase().includes(q) ||
          l.contactPerson.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.phone.toLowerCase().includes(q) ||
          l.assignedTo.toLowerCase().includes(q) ||
          l.status.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((l) => l.status === statusFilter);
    }

    if (assigneeFilter !== "all") {
      result = result.filter((l) => l.assignedTo === assigneeFilter);
    }

    if (priorityFilter !== "all") {
      result = result.filter((l) => l.priority === priorityFilter);
    }

    if (industryFilter !== "all") {
      result = result.filter((l) => l.industry === industryFilter);
    }

    if (sourceFilter !== "all") {
      result = result.filter((l) => l.source === sourceFilter);
    }

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
  }, [leads, searchQuery, statusFilter, assigneeFilter, priorityFilter, industryFilter, sourceFilter, sortField, sortOrder]);

  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return processedLeads.slice(start, start + rowsPerPage);
  }, [processedLeads, currentPage, rowsPerPage]);

  const totalItems = processedLeads.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  const renderSortHeader = (label: string, field: keyof Lead) => {
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
        title="Leads | ClienZo"
        description="View and manage all leads in ClienZo CRM."
      />
      <PageBreadcrumb pageTitle="Leads" />

      {/* Control Panel */}
      <div className="flex flex-col gap-4 mb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center w-full lg:w-auto">
          {/* Search */}
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
            {/* Status Filter */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsStatusOpen(!isStatusOpen);
                  setIsAssigneeOpen(false);
                  setIsPriorityOpen(false);
                }}
                className="flex items-center justify-between h-11 w-40 rounded-lg border border-gray-200 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 cursor-pointer dropdown-toggle hover:bg-gray-50 dark:hover:bg-white/5"
              >
                <span className="truncate">
                  {statusOptions.find((o) => o.value === statusFilter)?.label}
                </span>
                <ChevronDownIcon className="w-4 h-4 text-gray-500 shrink-0 ml-1" />
              </button>
              <Dropdown
                isOpen={isStatusOpen}
                onClose={() => setIsStatusOpen(false)}
                className="left-0 right-auto w-44 p-1 mt-2"
              >
                <ul className="flex flex-col gap-0.5">
                  {statusOptions.map((opt) => (
                    <li key={opt.value}>
                      <DropdownItem
                        onItemClick={() => {
                          setStatusFilter(opt.value);
                          setCurrentPage(1);
                          setIsStatusOpen(false);
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

            {/* Assignee Filter */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsAssigneeOpen(!isAssigneeOpen);
                  setIsStatusOpen(false);
                  setIsPriorityOpen(false);
                }}
                className="flex items-center justify-between h-11 w-40 rounded-lg border border-gray-200 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 cursor-pointer dropdown-toggle hover:bg-gray-50 dark:hover:bg-white/5"
              >
                <span className="truncate">
                  {assigneeOptions.find((o) => o.value === assigneeFilter)?.label}
                </span>
                <ChevronDownIcon className="w-4 h-4 text-gray-500 shrink-0 ml-1" />
              </button>
              <Dropdown
                isOpen={isAssigneeOpen}
                onClose={() => setIsAssigneeOpen(false)}
                className="left-0 right-auto w-44 p-1 mt-2"
              >
                <ul className="flex flex-col gap-0.5">
                  {assigneeOptions.map((opt) => (
                    <li key={opt.value}>
                      <DropdownItem
                        onItemClick={() => {
                          setAssigneeFilter(opt.value);
                          setCurrentPage(1);
                          setIsAssigneeOpen(false);
                        }}
                        className={`cursor-pointer rounded-lg text-left w-full px-3 py-2 text-sm ${assigneeFilter === opt.value
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

            {/* Priority Filter */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsPriorityOpen(!isPriorityOpen);
                  setIsStatusOpen(false);
                  setIsAssigneeOpen(false);
                }}
                className="flex items-center justify-between h-11 w-40 rounded-lg border border-gray-200 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 cursor-pointer dropdown-toggle hover:bg-gray-50 dark:hover:bg-white/5"
              >
                <span className="truncate">
                  {priorityOptions.find((o) => o.value === priorityFilter)?.label}
                </span>
                <ChevronDownIcon className="w-4 h-4 text-gray-500 shrink-0 ml-1" />
              </button>
              <Dropdown
                isOpen={isPriorityOpen}
                onClose={() => setIsPriorityOpen(false)}
                className="left-0 right-auto w-44 p-1 mt-2"
              >
                <ul className="flex flex-col gap-0.5">
                  {priorityOptions.map((opt) => (
                    <li key={opt.value}>
                      <DropdownItem
                        onItemClick={() => {
                          setPriorityFilter(opt.value);
                          setCurrentPage(1);
                          setIsPriorityOpen(false);
                        }}
                        className={`cursor-pointer rounded-lg text-left w-full px-3 py-2 text-sm ${priorityFilter === opt.value
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

            {/* Industry Filter */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsIndustryOpen(!isIndustryOpen);
                  setIsStatusOpen(false);
                  setIsAssigneeOpen(false);
                  setIsPriorityOpen(false);
                  setIsSourceOpen(false);
                }}
                className="flex items-center justify-between h-11 w-40 rounded-lg border border-gray-200 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 cursor-pointer dropdown-toggle hover:bg-gray-50 dark:hover:bg-white/5"
              >
                <span className="truncate">
                  {industryOptions.find((o) => o.value === industryFilter)?.label}
                </span>
                <ChevronDownIcon className="w-4 h-4 text-gray-500 shrink-0 ml-1" />
              </button>
              <Dropdown
                isOpen={isIndustryOpen}
                onClose={() => setIsIndustryOpen(false)}
                className="left-0 right-auto w-44 p-1 mt-2"
              >
                <ul className="flex flex-col gap-0.5 max-h-60 overflow-y-auto custom-scrollbar">
                  {industryOptions.map((opt) => (
                    <li key={opt.value}>
                      <DropdownItem
                        onItemClick={() => {
                          setIndustryFilter(opt.value);
                          setCurrentPage(1);
                          setIsIndustryOpen(false);
                        }}
                        className={`cursor-pointer rounded-lg text-left w-full px-3 py-2 text-sm ${industryFilter === opt.value
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

            {/* Source Filter */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsSourceOpen(!isSourceOpen);
                  setIsStatusOpen(false);
                  setIsAssigneeOpen(false);
                  setIsPriorityOpen(false);
                  setIsIndustryOpen(false);
                }}
                className="flex items-center justify-between h-11 w-40 rounded-lg border border-gray-200 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 cursor-pointer dropdown-toggle hover:bg-gray-50 dark:hover:bg-white/5"
              >
                <span className="truncate">
                  {sourceOptions.find((o) => o.value === sourceFilter)?.label}
                </span>
                <ChevronDownIcon className="w-4 h-4 text-gray-500 shrink-0 ml-1" />
              </button>
              <Dropdown
                isOpen={isSourceOpen}
                onClose={() => setIsSourceOpen(false)}
                className="left-0 right-auto w-44 p-1 mt-2"
              >
                <ul className="flex flex-col gap-0.5 max-h-60 overflow-y-auto custom-scrollbar">
                  {sourceOptions.map((opt) => (
                    <li key={opt.value}>
                      <DropdownItem
                        onItemClick={() => {
                          setSourceFilter(opt.value);
                          setCurrentPage(1);
                          setIsSourceOpen(false);
                        }}
                        className={`cursor-pointer rounded-lg text-left w-full px-3 py-2 text-sm ${sourceFilter === opt.value
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
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={uploadModal.openModal}
            startIcon={<FiUpload className="size-4" />}
            className="h-11 px-4 py-2.5"
          >
            Upload Excel
          </Button>
          <Button
            size="sm"
            onClick={() => navigate("/leads/add")}
            startIcon={<FiPlus className="size-4" />}
            className="h-11 px-4 py-2.5"
          >
            Add lead
          </Button>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedLeadIds.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 mb-4 rounded-xl border border-brand-200 bg-brand-50/50 dark:border-brand-500/30 dark:bg-brand-500/5">
          <span className="text-sm font-medium text-brand-700 dark:text-brand-400">
            {selectedLeadIds.length} lead{selectedLeadIds.length > 1 ? "s" : ""} selected
          </span>
          <div className="flex items-center gap-3">
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkAssign(e.target.value);
                  e.target.value = "";
                }
              }}
              className="h-9 w-44 appearance-none rounded-lg border border-gray-300 bg-white px-3 py-1.5 pr-8 text-xs shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundSize: '1.25rem',
                backgroundRepeat: 'no-repeat'
              }}
            >
              <option value="">Assign to...</option>
              {ASSIGNEES.map((assignee) => (
                <option key={assignee} value={assignee}>
                  {assignee}
                </option>
              ))}
            </select>
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkDelete}
              className="h-9 px-4 py-1.5 border-error-500 text-error-600 hover:bg-error-50 dark:hover:bg-error-500/10 dark:text-error-400 font-medium"
            >
              Delete selected
            </Button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] sticky top-0 bg-white dark:bg-gray-900 z-10">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-start whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={paginatedLeads.length > 0 && paginatedLeads.every(l => selectedLeadIds.includes(l.id))}
                    onChange={(e) => {
                      if (e.target.checked) {
                        const newIds = [...new Set([...selectedLeadIds, ...paginatedLeads.map(l => l.id)])];
                        setSelectedLeadIds(newIds);
                      } else {
                        const filteredIds = selectedLeadIds.filter(id => !paginatedLeads.some(l => l.id === id));
                        setSelectedLeadIds(filteredIds);
                      }
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {renderSortHeader("S.No", "id")}
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {renderSortHeader("Company", "company")}
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {renderSortHeader("Contact person", "contactPerson")}
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {renderSortHeader("Email", "email")}
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {renderSortHeader("Phone", "phone")}
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {renderSortHeader("Status", "status")}
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {renderSortHeader("Priority", "priority")}
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {renderSortHeader("Assigned to", "assignedTo")}
                </TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {paginatedLeads.length > 0 ? (
                paginatedLeads.map((lead) => (
                  <TableRow
                    key={lead.id}
                    className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <TableCell className="px-5 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedLeadIds.includes(lead.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLeadIds([...selectedLeadIds, lead.id]);
                          } else {
                            setSelectedLeadIds(selectedLeadIds.filter(id => id !== lead.id));
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                      />
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-800 dark:text-white/90">
                      {lead.id}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm font-medium text-gray-800 dark:text-white/90 whitespace-nowrap">
                      {lead.company}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {lead.contactPerson}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {lead.email}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {lead.phone}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm whitespace-nowrap">
                      <Badge size="sm" color={getStatusColor(lead.status)}>
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm whitespace-nowrap">
                      <Badge size="sm" color={getPriorityColor(lead.priority)}>
                        {lead.priority || "Medium"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm whitespace-nowrap">
                      <select
                        value={lead.assignedTo}
                        onChange={(e) => handleDirectAssign(lead.id, e.target.value)}
                        className="h-9 w-44 appearance-none rounded-lg border border-gray-300 bg-transparent px-3 py-1.5 pr-8 text-xs shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 cursor-pointer"
                        style={{
                          backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                          backgroundPosition: 'right 0.5rem center',
                          backgroundSize: '1.25rem',
                          backgroundRepeat: 'no-repeat'
                        }}
                      >
                        {ASSIGNEES.map((assignee) => (
                          <option
                            key={assignee}
                            value={assignee}
                            className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                          >
                            {assignee}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/leads/${lead.id}`)}
                          className="p-1.5 text-gray-500 hover:text-brand-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition cursor-pointer"
                          title="View"
                        >
                          <FiEye className="size-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/leads/${lead.id}/edit`)}
                          className="p-1.5 text-gray-500 hover:text-brand-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition cursor-pointer"
                          title="Edit"
                        >
                          <FiEdit className="size-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(lead)}
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
                    colSpan={8}
                    className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No leads found matching search criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

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
            itemName="leads"
          />
        )}
      </div>

      {/* Upload Excel Modal */}
      <Modal
        isOpen={uploadModal.isOpen}
        onClose={uploadModal.closeModal}
        className="max-w-[520px] m-4"
      >
        <div className="relative w-full rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
          <div className="pr-10 border-b border-gray-150 pb-4 mb-4 dark:border-gray-800">
            <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Upload Excel
            </h4>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Upload a .xlsx or .csv file to import leads in bulk.
            </p>
          </div>

          {/* Template Download Banner */}
          <div className="mb-6 p-4 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05] flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Need a template?</span>
              <span className="text-[11px] text-gray-400 mt-0.5">Use our format for a smooth import.</span>
            </div>
            <button
              type="button"
              onClick={downloadSampleTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-750 text-xs font-semibold text-brand-500 hover:text-brand-600 cursor-pointer shadow-theme-xs transition-colors shrink-0"
            >
              Download template
            </button>
          </div>

          {/* Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) setUploadedFile(file);
            }}
            className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-10 px-6 text-center transition-colors cursor-pointer ${dragOver
                ? "border-brand-400 bg-brand-50 dark:bg-brand-500/10"
                : "border-gray-200 hover:border-brand-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-white/5"
              }`}
            onClick={() => document.getElementById("excel-file-input")?.click()}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
              <FiUpload className="size-6 text-gray-500 dark:text-gray-400" />
            </div>
            {uploadedFile ? (
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {uploadedFile.name}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {(uploadedFile.size / 1024).toFixed(1)} KB — click to change
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Drag & drop your file here
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Supports .xlsx and .csv — max 10 MB
                </p>
              </div>
            )}
            <input
              id="excel-file-input"
              type="file"
              accept=".xlsx,.csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setUploadedFile(file);
              }}
            />
          </div>

          <div className="flex items-center justify-end gap-3 mt-6">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setUploadedFile(null);
                uploadModal.closeModal();
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!uploadedFile}
              onClick={() => {
                const file = uploadedFile;
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (e) => {
                  try {
                    const arrayBuffer = e.target?.result as ArrayBuffer;
                    const data = new Uint8Array(arrayBuffer);
                    const workbook = XLSX.read(data, { type: "array" });
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];

                    // Convert sheet rows into JS array of arrays
                    const rows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
                    if (rows.length <= 1) {
                      showToast("Uploaded file is empty or missing data rows.", "error");
                      return;
                    }

                    // Dynamically scan headers row (row index 0) for lead property mapping
                    const headers = rows[0].map(h => String(h || "").trim().toLowerCase());
                    const companyIdx = headers.findIndex(h => h.includes("company") || h.includes("lead"));
                    const contactIdx = headers.findIndex(h => h.includes("contact") || h.includes("person") || h.includes("name"));
                    const emailIdx = headers.findIndex(h => h.includes("email") || h.includes("mail"));
                    const phoneIdx = headers.findIndex(h => h.includes("phone") || h.includes("mobile") || h.includes("contact"));
                    const industryIdx = headers.findIndex(h => h.includes("industry"));
                    const sourceIdx = headers.findIndex(h => h.includes("source"));
                    const priorityIdx = headers.findIndex(h => h.includes("priority"));

                    if (companyIdx === -1 && contactIdx === -1 && emailIdx === -1) {
                      showToast("Required columns ('Company', 'Contact Person', or 'Email') not found.", "error");
                      return;
                    }

                    const newLeadsList = [...leads];
                    let addedCount = 0;
                    let duplicateCount = 0;

                    for (let i = 1; i < rows.length; i++) {
                      const row = rows[i];
                      if (!row || row.length === 0) continue;

                      const company = companyIdx !== -1 ? String(row[companyIdx] || "").trim() : "";
                      const contactPerson = contactIdx !== -1 ? String(row[contactIdx] || "").trim() : "";
                      const email = emailIdx !== -1 ? String(row[emailIdx] || "").trim() : "";
                      const phone = phoneIdx !== -1 ? String(row[phoneIdx] || "").trim() : "";
                      const industry = industryIdx !== -1 ? String(row[industryIdx] || "").trim() : "";
                      const source = sourceIdx !== -1 ? String(row[sourceIdx] || "").trim() : "";
                      const rawPriority = priorityIdx !== -1 ? String(row[priorityIdx] || "").trim() : "";
                      const priority = ["Low", "Medium", "High"].includes(rawPriority) ? rawPriority as LeadPriority : "Medium";

                      if (!company && !contactPerson && !email) continue;

                      // Duplicate email verification check
                      const isDuplicate = newLeadsList.some(
                        (l) => l.email && email && l.email.toLowerCase() === email.toLowerCase()
                      );
                      if (isDuplicate) {
                        duplicateCount++;
                        continue;
                      }

                      const nextId = newLeadsList.length > 0 ? Math.max(...newLeadsList.map(l => l.id)) + 1 : 1;
                      newLeadsList.push({
                        id: nextId,
                        company: company || "Unknown Corp",
                        contactPerson: contactPerson || "Jane Doe",
                        email: email || `contact@${company.toLowerCase().replace(/\s+/g, "") || "unknown"}.com`,
                        phone: phone || "+91 98765 00000",
                        status: "New",
                        priority: priority,
                        assignedTo: "John Doe",
                        industry: industry || "Technology",
                        source: source || "Website",
                        website: `https://${company.toLowerCase().replace(/\s+/g, "") || "example"}.com`,
                        address: "Imported Address",
                        notes: "Imported from file template.",
                        createdAt: new Date().toISOString().split("T")[0],
                      });
                      addedCount++;
                    }

                    if (addedCount > 0) {
                      setLeads(newLeadsList);
                      setStorage("clienzo_leads", newLeadsList);
                      if (duplicateCount > 0) {
                        showToast(`Successfully imported ${addedCount} leads. Skipped ${duplicateCount} duplicates.`, "warning");
                      } else {
                        showToast(`Successfully imported ${addedCount} leads from sheet!`, "success");
                      }
                    } else if (duplicateCount > 0) {
                      showToast(`Skipped import: All ${duplicateCount} records already exist.`, "error");
                    } else {
                      showToast("No valid rows found to import.", "error");
                    }
                  } catch (err) {
                    console.error("Excel import failed:", err);
                    showToast("Failed to parse file template.", "error");
                  }
                };
                reader.readAsArrayBuffer(file);

                setUploadedFile(null);
                uploadModal.closeModal();
              }}
            >
              Import leads
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.closeModal}
        className="max-w-[450px] m-4"
      >
        <div className="relative w-full rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-error-50 dark:bg-error-500/10 text-error-600 dark:text-error-400 mb-4">
              <FiTrash2 className="size-6" />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
              Delete lead
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Are you sure you want to delete{" "}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {selectedLead?.company}
              </span>
              ? This action cannot be undone.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={deleteModal.closeModal}
              className="w-1/2"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleDeleteConfirm}
              className="w-1/2 bg-error-600 hover:bg-error-700"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
