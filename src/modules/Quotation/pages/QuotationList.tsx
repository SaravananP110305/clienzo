import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { getStorage, setStorage } from "../../../utils/storage";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Badge from "../../../components/ui/badge/Badge";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import { Modal } from "../../../components/ui/modal";
import { useModal } from "../../../hooks/useModal";
import { Pagination } from "../../../components/ui/pagination/Pagination";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../../../components/ui/table";
import { ChevronDownIcon, ChevronUpIcon } from "../../../icons";
import {
  FiPlus,
  FiMail,
  FiDownload,
  FiEye,
  FiEdit,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiSend,
  FiRefreshCw,
  FiFileText,
  FiDollarSign,
  FiList,
  FiActivity,
  FiArrowLeft,
  FiArrowRight,
  FiInfo,
  FiUser,
  FiCalendar,
  FiTrendingUp,
} from "react-icons/fi";
import { useToast } from "../../../hooks/useToast";
import {
  Proposal,
  ProposalStatus,
  initialProposals,
} from "../data/quotationsData";
import { initialClients, Client } from "../../ClientManagement/data/clientsData";
import { initialLeads, Lead } from "../../LeadManagement/data/leadsData";
import jsPDF from "jspdf";

// ─── Constants ──────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  ProposalStatus,
  { label: string; color: "primary" | "success" | "error" | "warning" | "info" | "light" | "dark"; icon: React.ReactNode }
> = {
  Draft: { label: "Draft", color: "light", icon: <FiFileText className="size-3.5" /> },
  Sent: { label: "Sent", color: "info", icon: <FiSend className="size-3.5" /> },
  "Under Review": { label: "Under Review", color: "warning", icon: <FiClock className="size-3.5" /> },
  Negotiation: { label: "Negotiation", color: "warning", icon: <FiRefreshCw className="size-3.5" /> },
  Approved: { label: "Approved", color: "success", icon: <FiCheckCircle className="size-3.5" /> },
  Rejected: { label: "Rejected", color: "error", icon: <FiXCircle className="size-3.5" /> },
  Converted: { label: "Converted", color: "primary", icon: <FiTrendingUp className="size-3.5" /> },
};

const WORKFLOW_STEPS: ProposalStatus[] = [
  "Draft",
  "Sent",
  "Under Review",
  "Negotiation",
  "Approved",
  "Converted",
];



// ─── Helpers ────────────────────────────────────────────────────────────────

function generateId(arr: { id: number }[]): number {
  return arr.length > 0 ? Math.max(...arr.map((x) => x.id)) + 1 : 1;
}

function formatCurrency(amount: number): string {
  return "$" + amount.toLocaleString("en-US");
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return formatDate(dateStr);
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function QuotationList() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────────────────────
  const [proposals, setProposals] = useState<Proposal[]>(() => {
    const raw = getStorage<Proposal[]>("saiflow_proposals", initialProposals);
    // Validate stored data: if items lack the nested structure, it's stale — fall back to sample data
    if (raw.length > 0 && (!raw[0].requirement || !raw[0].proposalNo)) {
      setStorage("saiflow_proposals", initialProposals);
      return initialProposals;
    }
    return raw;
  });

  const [view, setView] = useState<"list" | "detail">("list");
  const [selectedProposalId, setSelectedProposalId] = useState<number | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<"requirement" | "estimation" | "quotation" | "workflow">("requirement");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Proposal>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);

  // Modals
  const deleteModal = useModal();
  const confirmActionModal = useModal();

  // Action confirmation
  const [confirmAction, setConfirmAction] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

  // ── Derived - Selected Proposal ────────────────────────────────────────────

  const selectedProposal = useMemo(
    () => proposals.find((p) => p.id === selectedProposalId) || null,
    [proposals, selectedProposalId]
  );

  const handleExportPDF = (proposal: Proposal) => {
    exportProposalToPDF(proposal, showToast);
  };

  const handleSort = (field: keyof Proposal) => {
    const isAsc = sortField === field && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setSortField(field);
  };



  // ── Status Management ──────────────────────────────────────────────────────

  const updateStatus = (proposalId: number, newStatus: ProposalStatus, notes: string) => {
    const proposal = proposals.find((p) => p.id === proposalId);
    if (!proposal) return;
    const updated = proposals.map((p) =>
      p.id === proposalId
        ? {
            ...p,
            status: newStatus,
            updatedAt: new Date().toISOString().split("T")[0],
            workflowLogs: [
              ...p.workflowLogs,
              {
                id: generateId(p.workflowLogs),
                action: `Status changed to ${newStatus}`,
                fromStatus: p.status,
                toStatus: newStatus,
                timestamp: new Date().toISOString(),
                performedBy: "Current User",
                notes,
              },
            ],
          }
        : p
    );
    setProposals(updated);
    setStorage("saiflow_proposals", updated);
    showToast(`Proposal ${proposal.proposalNo} moved to "${STATUS_CONFIG[newStatus].label}"`, "success");
  };

  const handleStatusAction = (action: string, proposal: Proposal) => {
    setSelectedProposalId(proposal.id);
    switch (action) {
      case "send":
        setConfirmAction({
          title: "Send Proposal",
          message: `Mark proposal ${proposal.proposalNo} as "Sent" and notify the lead?`,
          onConfirm: () => updateStatus(proposal.id, "Sent", "Proposal sent to client for review."),
        });
        confirmActionModal.openModal();
        break;
      case "convert":
        setConfirmAction({
          title: "Convert to Client",
          message: `Mark proposal ${proposal.proposalNo} as "Converted" and create a client record for ${proposal.companyName}? You'll be redirected to the Clients page.`,
          onConfirm: () => {
            // Update proposal status
            updateStatus(proposal.id, "Converted", "Lead converted to client. Project initiated.");
            // Find and update associated lead status to "Won" in storage
            const leads = getStorage<Lead[]>("saiflow_leads", initialLeads);
            const updatedLeads = leads.map((l) => {
              const isMatch =
                (l.company && l.company.toLowerCase() === proposal.companyName.toLowerCase()) ||
                (l.email && l.email.toLowerCase() === proposal.leadEmail.toLowerCase()) ||
                (l.phone && l.phone === proposal.leadPhone);
              return isMatch ? { ...l, status: "Won" as const } : l;
            });
            setStorage("saiflow_leads", updatedLeads);

            // Create client entry from proposal data
            const currentClients = getStorage<Client[]>("saiflow_clients", initialClients);
            const newClientId = currentClients.length > 0 ? Math.max(...currentClients.map((c) => c.id)) + 1 : 1;
            const newClient: Client = {
              id: newClientId,
              name: proposal.leadName,
              company: proposal.companyName,
              email: proposal.leadEmail,
              phone: proposal.leadPhone,
              projectsCount: 1,
              status: "Active",
              clientSince: new Date().toISOString().split("T")[0],
              conversionDate: new Date().toISOString().split("T")[0],
              latestProposalId: proposal.id,
              latestProposalNo: proposal.proposalNo,
              proposalStatus: proposal.status,
              handoverStatus: "Pending",
            };
            setStorage("saiflow_clients", [...currentClients, newClient]);
            showToast(`Client "${proposal.companyName}" created successfully!`, "success");
            // Navigate to clients page
            navigate("/clients");
          },
        });
        confirmActionModal.openModal();
        break;
      case "reject":
        setConfirmAction({
          title: "Reject Proposal",
          message: `Mark proposal ${proposal.proposalNo} as "Rejected"? This will close the proposal.`,
          onConfirm: () => updateStatus(proposal.id, "Rejected", "Proposal rejected by client."),
        });
        confirmActionModal.openModal();
        break;
      case "approved":
        setConfirmAction({
          title: "Approve Proposal",
          message: `Mark proposal ${proposal.proposalNo} as "Approved"?`,
          onConfirm: () => updateStatus(proposal.id, "Approved", "Client approved the proposal."),
        });
        confirmActionModal.openModal();
        break;
      case "negotiate":
        setConfirmAction({
          title: "Start Negotiation",
          message: `Move proposal ${proposal.proposalNo} to "Negotiation"? You can create a revised version.`,
          onConfirm: () => updateStatus(proposal.id, "Negotiation", "Client requested revisions - moved to negotiation."),
        });
        confirmActionModal.openModal();
        break;
    }
  };

  // ── Revise (Navigate to edit page in negotiation mode) ──────────────────────

  const handleRevise = (proposal: Proposal) => {
    // Update status to Negotiation and log the action, then navigate to edit
    updateStatus(proposal.id, "Negotiation", "Client requested revisions - moved to negotiation.");
    navigate(`/quotations/${proposal.id}/edit`);
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDeleteConfirm = () => {
    if (!selectedProposal) return;
    const updated = proposals.filter((p) => p.id !== selectedProposal.id);
    setProposals(updated);
    setStorage("saiflow_proposals", updated);
    showToast(`Proposal ${selectedProposal.proposalNo} deleted.`, "success");
    deleteModal.closeModal();
    if (view === "detail") setView("list");
  };

  // ── List View Processing ───────────────────────────────────────────────────

  const processedProposals = useMemo(() => {
    let result = [...proposals];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.proposalNo.toLowerCase().includes(q) ||
          p.companyName.toLowerCase().includes(q) ||
          p.leadName.toLowerCase().includes(q) ||
          p.leadEmail.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
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
  }, [proposals, searchQuery, statusFilter, sortField, sortOrder]);

  const paginatedProposals = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return processedProposals.slice(start, start + rowsPerPage);
  }, [processedProposals, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(processedProposals.length / rowsPerPage);



  // ── Render: List View ──────────────────────────────────────────────────────

  const renderListView = () => (
    <>
      {/* Filters & Actions */}
      <div className="flex flex-col gap-3 mb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center w-full lg:w-auto">
          <div className="w-full sm:w-64">
            <Input
              type="text"
              placeholder="Search proposals..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)}
              className="flex items-center justify-between h-11 w-44 rounded-lg border border-gray-200 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5"
            >
              <span className="truncate text-left flex-1">
                {statusFilter === "all" ? "All Statuses" : STATUS_CONFIG[statusFilter as ProposalStatus]?.label || statusFilter}
              </span>
              <ChevronDownIcon className="w-4 h-4 text-gray-500 shrink-0 ml-2" />
            </button>
            <div className={`absolute left-0 w-44 p-1 mt-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg z-50 ${isStatusFilterOpen ? "block" : "hidden"}`}>
              <ul className="flex flex-col gap-0.5">
                <li>
                  <button onClick={() => { setStatusFilter("all"); setCurrentPage(1); setIsStatusFilterOpen(false); }}
                    className={`cursor-pointer rounded-lg text-left w-full px-3 py-2 text-sm ${statusFilter === "all" ? "bg-brand-500 text-white" : "text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"}`}>
                    All Statuses
                  </button>
                </li>
                {(Object.keys(STATUS_CONFIG) as ProposalStatus[]).map((st) => (
                  <li key={st}>
                    <button onClick={() => { setStatusFilter(st); setCurrentPage(1); setIsStatusFilterOpen(false); }}
                      className={`cursor-pointer rounded-lg text-left w-full px-3 py-2 text-sm flex items-center gap-2 ${statusFilter === st ? "bg-brand-500 text-white" : "text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"}`}>
                      {STATUS_CONFIG[st].icon}
                      {STATUS_CONFIG[st].label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <Button onClick={() => navigate("/quotations/add")} variant="primary" size="sm" startIcon={<FiPlus />}>
          New Proposal
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] sticky top-0 bg-white dark:bg-gray-900 z-10">
              <TableRow>
                {[
                  { key: "proposalNo", label: "Proposal No" },
                  { key: "companyName", label: "Company" },
                  { key: "leadName", label: "Lead Contact" },
                  { key: null, label: "Amount" },
                  { key: "status", label: "Status" },
                  { key: "updatedAt", label: "Last Updated" },
                  { key: null, label: "" },
                ].map((col) => (
                  <TableCell key={col.label} isHeader className={`px-5 py-3 text-${col.key === "Amount" || col.key === "" ? "end" : "start"} text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap`}>
                    {col.key ? (
                      <button onClick={() => { if (col.key) handleSort(col.key as keyof Proposal); }}
                        className="flex items-center gap-1.5 font-medium hover:text-gray-900 dark:hover:text-white cursor-pointer">
                        {col.label}
                        <span className="flex flex-col">
                          <ChevronUpIcon className={`w-3 h-3 -mb-1 transition-colors ${sortField === col.key && sortOrder === "asc" ? "text-brand-500" : "text-gray-300 dark:text-gray-600"}`} />
                          <ChevronDownIcon className={`w-3 h-3 transition-colors ${sortField === col.key && sortOrder === "desc" ? "text-brand-500" : "text-gray-300 dark:text-gray-600"}`} />
                        </span>
                      </button>
                    ) : col.label === "Amount" ? (
                      <span className="flex items-center justify-end">Amount</span>
                    ) : (
                      <span>{col.label}</span>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {paginatedProposals.length > 0 ? (
                paginatedProposals.map((proposal) => {
                  const totalAmount = proposal.estimation.total || 0;
                  return (
                    <TableRow key={proposal.id}
                      className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                      onClick={() => { setSelectedProposalId(proposal.id); setView("detail"); setActiveDetailTab("requirement"); }}
                    >
                      <TableCell className="px-5 py-4 text-theme-sm font-medium text-gray-800 dark:text-white/90">
                        {proposal.proposalNo}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm font-medium text-gray-800 dark:text-white/90">
                        {proposal.companyName}
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="text-theme-sm font-medium text-gray-800 dark:text-white/90">{proposal.leadName}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{proposal.leadEmail}</div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-end font-semibold text-gray-800 dark:text-white/90">
                        {formatCurrency(totalAmount)}
                      </TableCell>
                      <TableCell className="px-5 py-4 whitespace-nowrap">
                        <Badge size="sm" color={STATUS_CONFIG[proposal.status].color}>
                          <span className="flex items-center gap-1">
                            {STATUS_CONFIG[proposal.status].icon}
                            {STATUS_CONFIG[proposal.status].label}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                        <div>{formatDate(proposal.updatedAt)}</div>
                        <div className="text-xs">{getTimeAgo(proposal.updatedAt)}</div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-end">
                        <div className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => { setSelectedProposalId(proposal.id); setView("detail"); setActiveDetailTab("requirement"); }}
                            className="p-1.5 text-gray-500 hover:text-brand-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition" title="View">
                            <FiEye className="size-4" />
                          </button>
                          <button onClick={() => navigate(`/quotations/${proposal.id}/edit`)}
                            className="p-1.5 text-gray-500 hover:text-brand-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition" title="Edit">
                            <FiEdit className="size-4" />
                          </button>
                          <button onClick={() => handleExportPDF(proposal)}
                            className="p-1.5 text-gray-500 hover:text-cyan-600 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition" title="Export PDF">
                            <FiDownload className="size-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <FiFileText className="size-10 text-gray-300 dark:text-gray-600" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">No proposals found.</p>
                      <Button onClick={() => navigate("/quotations/add")} variant="outline" size="sm" startIcon={<FiPlus />}>
                        Create First Proposal
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {processedProposals.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={processedProposals.length}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={(rows) => { setRowsPerPage(rows); setCurrentPage(1); }}
          itemName="proposals"
        />
      )}
    </>
  );

  const renderDetailView = () => {
    if (!selectedProposal) return null;

    const status = STATUS_CONFIG[selectedProposal.status];

    const tabs = [
      { key: "requirement" as const, label: "Requirement", icon: <FiList className="size-4" /> },
      { key: "estimation" as const, label: "Estimation", icon: <FiDollarSign className="size-4" /> },
      { key: "quotation" as const, label: "Quotation", icon: <FiFileText className="size-4" /> },
      { key: "workflow" as const, label: "Workflow", icon: <FiActivity className="size-4" /> },
    ];

    return (
      <div className="space-y-5">
        {/* Back & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button onClick={() => setView("list")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition cursor-pointer">
            <FiArrowLeft className="size-4" />
            Back to Proposals
          </button>
          <div className="flex flex-wrap gap-2">
            {selectedProposal.status === "Draft" && (
              <Button onClick={() => handleStatusAction("send", selectedProposal)} size="sm" variant="primary" startIcon={<FiSend />}>
                Send Proposal
              </Button>
            )}
            {selectedProposal.status === "Under Review" && (
              <>
                <Button onClick={() => handleStatusAction("negotiate", selectedProposal)} size="sm" variant="outline" startIcon={<FiRefreshCw />}>
                  Negotiate
                </Button>
                <Button onClick={() => handleStatusAction("approved", selectedProposal)} size="sm" variant="primary" startIcon={<FiCheckCircle />}>
                  Approve
                </Button>
              </>
            )}
            {(selectedProposal.status === "Sent" || selectedProposal.status === "Under Review") && (
              <Button onClick={() => handleStatusAction("reject", selectedProposal)} size="sm" variant="outline" startIcon={<FiXCircle />}>
                Reject
              </Button>
            )}
            {selectedProposal.status === "Negotiation" && (
              <Button onClick={() => handleRevise(selectedProposal)} size="sm" variant="primary" startIcon={<FiRefreshCw />}>
                Revise Proposal
              </Button>
            )}
            {selectedProposal.status === "Approved" && (
              <Button onClick={() => handleStatusAction("convert", selectedProposal)} size="sm" variant="primary" startIcon={<FiTrendingUp />}>
                Convert to Client
              </Button>
            )}
            <Button onClick={() => navigate(`/quotations/${selectedProposal.id}/edit`)} size="sm" variant="outline" startIcon={<FiEdit />}>
              Edit
            </Button>
            <Button onClick={() => handleExportPDF(selectedProposal)} size="sm" variant="outline" startIcon={<FiDownload />}>
              PDF
            </Button>
            <a href={`mailto:${selectedProposal.leadEmail}?subject=Business Proposal ${selectedProposal.proposalNo} - ${selectedProposal.companyName}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-white/5 transition"
            >
              <FiMail className="size-4" />
              Email
            </a>
          </div>
        </div>

        {/* Proposal Header Card */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">{selectedProposal.proposalNo}</h2>
                <Badge size="sm" color={status.color}>
                  <span className="flex items-center gap-1">{status.icon}{status.label}</span>
                </Badge>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedProposal.companyName} &middot; {selectedProposal.leadName} &middot; {selectedProposal.leadEmail}
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1"><FiCalendar className="size-3.5" /> Created {formatDate(selectedProposal.createdAt)}</span>
              <span className="flex items-center gap-1"><FiRefreshCw className="size-3.5" /> Updated {getTimeAgo(selectedProposal.updatedAt)}</span>
            </div>
          </div>

          {/* Workflow Steps */}
          <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/[0.05]">
            <div className="flex items-center gap-0 overflow-x-auto pb-1">
              {WORKFLOW_STEPS.map((step, idx) => {
                const stepIdx = WORKFLOW_STEPS.indexOf(selectedProposal.status);
                const rejected = selectedProposal.status === "Rejected";
                const converted = selectedProposal.status === "Converted";
                const isCompleted = idx < stepIdx;
                const isCurrent = idx === stepIdx;

                let stepStatus: "completed" | "current" | "incomplete" | "rejected" = "incomplete";
                if (rejected && idx === stepIdx) stepStatus = "rejected";
                else if (converted && isCompleted) stepStatus = "completed";
                else if (isCompleted) stepStatus = "completed";
                else if (isCurrent) stepStatus = rejected ? "rejected" : "current";
                else stepStatus = "incomplete";

                const stepColors = {
                  completed: "bg-emerald-500 text-white border-emerald-500",
                  current: "bg-brand-500 text-white border-brand-500 ring-2 ring-brand-200 dark:ring-brand-700",
                  incomplete: "bg-gray-100 text-gray-400 border-gray-200 dark:bg-gray-800 dark:border-gray-700",
                  rejected: "bg-red-500 text-white border-red-500",
                };

                return (
                  <div key={step} className="flex items-center gap-0">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-bold shrink-0 transition-all ${stepColors[stepStatus]}`}>
                      {stepStatus === "completed" || (converted && idx < stepIdx) ? (
                        <FiCheckCircle className="size-4" />
                      ) : stepStatus === "rejected" ? (
                        <FiXCircle className="size-4" />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <div className={`text-xs font-medium px-2 whitespace-nowrap ${stepStatus === "incomplete" ? "text-gray-400" : "text-gray-700 dark:text-gray-300"}`}>
                      {STATUS_CONFIG[step]?.label || step}
                    </div>
                    {idx < WORKFLOW_STEPS.length - 1 && (
                      <div className={`w-6 sm:w-10 h-0.5 mx-0.5 ${idx < stepIdx || (converted && idx < stepIdx) ? "bg-emerald-400" : idx === stepIdx && !rejected ? "bg-brand-300" : "bg-gray-200 dark:bg-gray-700"}`} />
                    )}
                  </div>
                );
              })}
              {selectedProposal.status === "Converted" && (
                <div className="flex items-center gap-0 ml-2">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-bold bg-purple-500 text-white border-purple-500">
                    <FiTrendingUp className="size-4" />
                  </div>
                  <span className="text-xs font-medium px-2 text-purple-600 dark:text-purple-400">Client</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-white/[0.05]">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveDetailTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition cursor-pointer ${
                activeDetailTab === tab.key
                  ? "text-brand-600 border-brand-500 dark:text-brand-400 dark:border-brand-400"
                  : "text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}>
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          {activeDetailTab === "requirement" && renderRequirementTab(selectedProposal)}
          {activeDetailTab === "estimation" && renderEstimationTab(selectedProposal)}
          {activeDetailTab === "quotation" && renderQuotationTab(selectedProposal)}
          {activeDetailTab === "workflow" && renderWorkflowTab()}
        </div>
      </div>
    );
  };

  // ── Render: Requirement Tab ────────────────────────────────────────────────

  // ── Render: Requirement Tab ────────────────────────────────────────────────

  const renderRequirementTab = (proposal: Proposal) => (
    <div className="p-5 space-y-6">
      <div>
        <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
          <FiInfo className="size-4 text-brand-500" /> Overview
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{proposal.requirement.overview || "No overview provided."}</p>
      </div>

      <SectionBlock title="Objectives" items={proposal.requirement.objectives} emptyText="No objectives defined." />
      <SectionBlock title="Technical Requirements" items={proposal.requirement.technicalRequirements} emptyText="No technical requirements defined." />
      <SectionBlock title="Deliverables" items={proposal.requirement.deliverables} emptyText="No deliverables defined." />
      <SectionBlock title="Assumptions" items={proposal.requirement.assumptions} emptyText="No assumptions defined." />
      <SectionBlock title="Constraints" items={proposal.requirement.constraints} emptyText="No constraints defined." />
    </div>
  );

  // ── Render: Estimation Tab ─────────────────────────────────────────────────

  const renderEstimationTab = (proposal: Proposal) => {
    const est = proposal.estimation;
    return (
      <div className="p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                <th className="text-left py-3 px-3 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase">Category</th>
                <th className="text-left py-3 px-3 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase">Description</th>
                <th className="text-right py-3 px-3 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase">Qty</th>
                <th className="text-right py-3 px-3 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase">Unit</th>
                <th className="text-right py-3 px-3 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase">Unit Price</th>
                <th className="text-right py-3 px-3 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/[0.03]">
              {est.items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                  <td className="py-3 px-3">
                    <Badge size="sm" color="primary">{item.category}</Badge>
                  </td>
                  <td className="py-3 px-3 text-gray-700 dark:text-gray-300">{item.description}</td>
                  <td className="py-3 px-3 text-right text-gray-700 dark:text-gray-300">{item.quantity}</td>
                  <td className="py-3 px-3 text-right text-gray-500 dark:text-gray-400 text-xs">{item.unit}</td>
                  <td className="py-3 px-3 text-right text-gray-700 dark:text-gray-300">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-3 px-3 text-right font-medium text-gray-800 dark:text-white">{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-100 dark:border-white/[0.05]">
                <td colSpan={5} className="py-3 px-3 text-right text-sm text-gray-500 dark:text-gray-400">Subtotal</td>
                <td className="py-3 px-3 text-right text-sm text-gray-800 dark:text-white">{formatCurrency(est.subtotal)}</td>
              </tr>
              {est.discountPercent > 0 && (
                <tr>
                  <td colSpan={5} className="py-1 px-3 text-right text-sm text-gray-500 dark:text-gray-400">Discount ({est.discountPercent}%)</td>
                  <td className="py-1 px-3 text-right text-sm text-red-500">-{formatCurrency(est.discountAmount)}</td>
                </tr>
              )}
              <tr>
                <td colSpan={5} className="py-1 px-3 text-right text-sm text-gray-500 dark:text-gray-400">Tax ({est.taxPercent}%)</td>
                <td className="py-1 px-3 text-right text-sm text-gray-800 dark:text-white">{formatCurrency(est.taxAmount)}</td>
              </tr>
              <tr className="border-t-2 border-gray-200 dark:border-white/[0.1]">
                <td colSpan={5} className="py-3 px-3 text-right text-base font-bold text-gray-800 dark:text-white">Total</td>
                <td className="py-3 px-3 text-right text-base font-bold text-brand-600 dark:text-brand-400">{formatCurrency(est.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };

  // ── Render: Quotation Tab ──────────────────────────────────────────────────

  const renderQuotationTab = (proposal: Proposal) => {
    const quote = proposal.quotation;
    return (
      <div className="p-5 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <InfoCard label="Payment Terms" value={quote.paymentTerms} />
          <InfoCard label="Validity" value={`${quote.validityDays} days`} />
          <InfoCard label="Delivery Timeline" value={quote.deliveryTimeline} />
          <InfoCard label="Warranty Period" value={quote.warrantyPeriod} />
        </div>

        {quote.paymentMilestones.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">Payment Milestones</h3>
            <div className="space-y-2">
              {quote.paymentMilestones.map((m, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/[0.03] rounded-lg">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{m.milestone}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-brand-600 dark:text-brand-400">{m.percentage}%</span>
                    <span className="text-sm font-semibold text-gray-800 dark:text-white">{formatCurrency(m.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">Notes</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{quote.notes || "No additional notes."}</p>
        </div>

        {quote.termsAndConditions && (
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">Terms &amp; Conditions</h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line leading-relaxed">{quote.termsAndConditions}</div>
          </div>
        )}
      </div>
    );
  };

  // ── Render: Workflow Tab ───────────────────────────────────────────────────

  const renderWorkflowTab = () => {
    if (!selectedProposal) return null;
    return (
      <div className="p-5">
        <div className="relative pl-8 space-y-4">
          {[...selectedProposal.workflowLogs].reverse().map((log) => (
            <div key={log.id} className="relative">
              <div className="absolute left-[-20px] top-4 bottom-0 w-0.5 bg-gray-100 dark:bg-gray-800" />
              <div className="absolute left-[-25px] top-1 w-2.5 h-2.5 rounded-full bg-brand-400 dark:bg-brand-600" />
              <div className="p-3 rounded-lg border border-gray-100 dark:border-white/[0.05] hover:bg-gray-50 dark:hover:bg-white/[0.02] transition">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800 dark:text-white">{log.action}</span>
                    {log.fromStatus !== log.toStatus && (
                      <div className="flex items-center gap-1.5">
                        <Badge size="sm" color={STATUS_CONFIG[log.fromStatus]?.color || "light"}>{log.fromStatus}</Badge>
                        <FiArrowRight className="size-3 text-gray-400" />
                        <Badge size="sm" color={STATUS_CONFIG[log.toStatus]?.color || "primary"}>{log.toStatus}</Badge>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">{formatDateTime(log.timestamp)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <FiUser className="size-3" />
                  {log.performedBy}
                </div>
                {log.notes && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">"{log.notes}"</p>
                )}
              </div>
            </div>
          ))}
          {selectedProposal.workflowLogs.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">No workflow activity recorded.</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <PageMeta title="Business Proposal | SaiFlow" description="Create, manage, and track business proposals with full version history and workflow." />
      <PageBreadcrumb pageTitle="Business Proposals" />

      {view === "list" ? renderListView() : renderDetailView()}
      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.closeModal} className="max-w-md p-6">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">Delete Proposal</h4>
        <p className="text-sm text-gray-500 mb-6">
          Are you sure you want to delete proposal "{selectedProposal?.proposalNo}"? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button onClick={deleteModal.closeModal} variant="outline" size="sm">Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="primary" className="bg-error-600 hover:bg-error-700 border-error-600 text-white" size="sm">Delete</Button>
        </div>
      </Modal>

      {/* Action Confirmation Modal */}
      <Modal isOpen={confirmActionModal.isOpen} onClose={confirmActionModal.closeModal} className="max-w-md p-6">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">{confirmAction?.title}</h4>
        <p className="text-sm text-gray-500 mb-6">{confirmAction?.message}</p>
        <div className="flex justify-end gap-3">
          <Button onClick={confirmActionModal.closeModal} variant="outline" size="sm">Cancel</Button>
          <Button onClick={() => { confirmAction?.onConfirm(); confirmActionModal.closeModal(); }} variant="primary" size="sm">
            Confirm
          </Button>
        </div>
      </Modal>


    </>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function SectionBlock({ title, items, emptyText }: { title: string; items: string[]; emptyText: string }) {
  const filtered = items.filter((i) => i.trim());
  if (filtered.length === 0) {
    return (
      <div>
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">{title}</h3>
        <p className="text-xs text-gray-400 italic">{emptyText}</p>
      </div>
    );
  }
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">{title}</h3>
      <ul className="space-y-1.5">
        {filtered.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-400 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-lg border border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-white/[0.02]">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-800 dark:text-white">{value || "—"}</p>
    </div>
  );
}

export function exportProposalToPDF(proposal: Proposal, showToast: (msg: string, type: "info" | "success" | "error") => void) {
  try {
    showToast("Generating PDF...", "info");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    let y = 20;

    y += 14;

    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text("Business Proposal", pageWidth / 2, y, { align: "center" });
    y += 8;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(100, 100, 100);
    pdf.text(`${proposal.proposalNo} | ${proposal.createdAt ? new Date(proposal.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}`, pageWidth / 2, y, { align: "center" });
    y += 6;
    pdf.text(`Status: ${proposal.status}`, pageWidth / 2, y, { align: "center" });
    y += 12;

    const req = proposal.requirement;
    const est = proposal.estimation;
    const quot = proposal.quotation;

    // Helpers
    const line = () => {
      pdf.setDrawColor(220, 220, 220);
      pdf.line(14, y, pageWidth - 14, y);
      y += 6;
    };
    const sectionTitle = (title: string) => {
      pdf.setFontSize(13);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(30, 30, 30);
      pdf.text(title, 14, y);
      y += 7;
    };
    const bodyText = (text: string) => {
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(60, 60, 60);
      const lines = pdf.splitTextToSize(text || "", pageWidth - 28);
      lines.forEach((l: string) => {
        if (y > 280) {
          pdf.addPage();
          y = 20;
        }
        pdf.text(l, 14, y);
        y += 5;
      });
    };
    const bulletItem = (text: string) => {
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(60, 60, 60);
      const lines = pdf.splitTextToSize(`• ${text}`, pageWidth - 36);
      lines.forEach((l: string) => {
        if (y > 280) {
          pdf.addPage();
          y = 20;
        }
        pdf.text(l, 20, y);
        y += 4.5;
      });
    };

    // Client Info
    sectionTitle("Client Information");
    bodyText(`Company: ${proposal.companyName}`);
    bodyText(`Contact: ${proposal.leadName} (${proposal.leadEmail})`);
    bodyText(`Phone: ${proposal.leadPhone}`);
    y += 4;
    line();

    // Requirement
    sectionTitle("1. Requirement");
    sectionTitle("Overview");
    bodyText(req.overview || "—");
    
    if (req.objectives && req.objectives.length > 0) {
      sectionTitle("Objectives");
      req.objectives.forEach((o) => bulletItem(o));
    }
    if (req.technicalRequirements && req.technicalRequirements.length > 0) {
      sectionTitle("Technical Requirements");
      req.technicalRequirements.forEach((t) => bulletItem(t));
    }
    if (req.deliverables && req.deliverables.length > 0) {
      sectionTitle("Deliverables");
      req.deliverables.forEach((d) => bulletItem(d));
    }
    y += 2;
    line();

    // Estimation
    sectionTitle("2. Estimation");
    if (est.items && est.items.length > 0) {
      // Table header
      const col1 = 14, col2 = 60, col3 = 120, col4 = 140, col5 = 160, colWidth = pageWidth - 28;
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(255, 255, 255);
      pdf.setFillColor(59, 130, 246);
      pdf.rect(14, y - 3, colWidth, 6, "F");
      pdf.text("Category", col1 + 2, y + 1);
      pdf.text("Description", col2 + 2, y + 1);
      pdf.text("Qty", col3 + 2, y + 1);
      pdf.text("Rate", col4 + 2, y + 1);
      pdf.text("Amount", col5 + 2, y + 1);
      y += 5;

      pdf.setFont("helvetica", "normal");
      est.items.forEach((item, idx) => {
        if (y > 270) {
          pdf.addPage();
          y = 20;
        }
        pdf.setFillColor(idx % 2 === 0 ? 245 : 255, idx % 2 === 0 ? 247 : 255, idx % 2 === 0 ? 250 : 255);
        pdf.rect(14, y - 2.5, colWidth, 5, "F");
        pdf.setTextColor(60, 60, 60);
        const desc = pdf.splitTextToSize(item.description, 55)[0] || "";
        pdf.text(item.category.substring(0, 12), col1 + 2, y + 1);
        pdf.text(String(desc).substring(0, 30), col2 + 2, y + 1);
        pdf.text(String(item.quantity), col3 + 2, y + 1);
        pdf.text(formatCurrency(item.unitPrice), col4 + 2, y + 1);
        pdf.text(formatCurrency(item.amount), col5 + 2, y + 1);
        y += 5;
      });

      // Totals
      y += 2;
      const totalX = pageWidth - 60;
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(60, 60, 60);
      pdf.text(`Subtotal:`, totalX, y);
      pdf.text(formatCurrency(est.subtotal), pageWidth - 14, y, { align: "right" });
      y += 5;
      if (est.discountPercent > 0) {
        pdf.text(`Discount (${est.discountPercent}%):`, totalX, y);
        pdf.text(`-${formatCurrency(est.discountAmount)}`, pageWidth - 14, y, { align: "right" });
        y += 5;
      }
      pdf.text(`Tax (${est.taxPercent}%):`, totalX, y);
      pdf.text(formatCurrency(est.taxAmount), pageWidth - 14, y, { align: "right" });
      y += 5;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text("Total:", totalX, y);
      pdf.text(formatCurrency(est.total), pageWidth - 14, y, { align: "right" });
      y += 8;
    }
    line();

    // Quotation
    sectionTitle("3. Quotation / Pricing Terms");
    bodyText(`Payment Terms: ${quot.paymentTerms}`);
    bodyText(`Validity: ${quot.validityDays} days`);
    bodyText(`Delivery Timeline: ${quot.deliveryTimeline}`);
    bodyText(`Warranty: ${quot.warrantyPeriod}`);
    y += 2;

    if (quot.paymentMilestones && quot.paymentMilestones.length > 0) {
      sectionTitle("Payment Milestones");
      quot.paymentMilestones.forEach((m) => {
        bulletItem(`${m.milestone} - ${m.percentage}% (${formatCurrency(m.amount)})`);
      });
      y += 2;
    }

    bodyText(`Notes: ${quot.notes}`);
    const tnc = quot.termsAndConditions?.split("\n") || [];
    if (tnc.length > 0) {
      sectionTitle("Terms & Conditions");
      tnc.forEach((t) => bulletItem(t));
    }

    // Footer
    y = 285;
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "italic");
    pdf.setTextColor(150, 150, 150);
    pdf.text(`Generated on ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })} | SaiFlow CRM`, pageWidth / 2, y, { align: "center" });

    pdf.save(`${proposal.proposalNo.replace(/\//g, "-")}.pdf`);
    showToast("PDF exported successfully!", "success");
  } catch (err) {
    console.error("PDF export error:", err);
    showToast("Failed to generate PDF.", "error");
  }
}
