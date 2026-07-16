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
import { ChevronDownIcon } from "../../../icons";
import {
  FiEye,
  FiDownload,
  FiShield,
  FiCheckCircle,
  FiClock,
  FiUsers,
  FiFileText,
  FiCalendar,
  FiUser,
  FiTrendingUp,
  FiRefreshCw,
} from "react-icons/fi";
import { useToast } from "../../../hooks/useToast";
import { Client, HandoverRecord, initialClients } from "../data/clientsData";
import { Proposal, initialProposals } from "../../Quotation/data/quotationsData";
import jsPDF from "jspdf";

// ─── Constants ──────────────────────────────────────────────────────────────

const HANDOVER_TEAMS = [
  "Dev Team Alpha",
  "Dev Team Beta",
  "Dev Team Gamma",
  "QA Team",
  "DevOps Team",
  "Full Stack Team",
];

const HANDOVER_ITEMS: { key: keyof HandoverRecord["transferredData"]; label: string }[] = [
  { key: "clientDetails", label: "Client Details" },
  { key: "leadDetails", label: "Lead Details" },
  { key: "requirement", label: "Requirement" },
  { key: "estimation", label: "Estimation" },
  { key: "quotation", label: "Quotation" },
  { key: "approvedProposalPdf", label: "Approved Proposal PDF" },
  { key: "summary", label: "Summary" },
  { key: "notes", label: "Notes" },
];

const PROPOSAL_STATUS_COLORS: Record<string, "primary" | "success" | "error" | "warning" | "info" | "light" | "dark"> = {
  Draft: "light",
  Sent: "info",
  "Under Review": "warning",
  Negotiation: "warning",
  Approved: "success",
  Rejected: "error",
  Converted: "primary",
};

const HANDOVER_STATUS_COLORS: Record<string, "primary" | "success" | "warning" | "info" | "light"> = {
  Pending: "warning",
  "In Progress": "info",
  Completed: "success",
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatCurrency(amount: number): string {
  return "$" + amount.toLocaleString("en-US");
}

function generateId(arr: { id: number }[]): number {
  return arr.length > 0 ? Math.max(...arr.map((x) => x.id)) + 1 : 1;
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function ClientList() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // ── State ──────────────────────────────────────────────────────────────────
  const [clients, setClients] = useState<Client[]>(() => {
    const raw = getStorage<Client[]>("saiflow_clients", initialClients);
    if (raw.length > 0 && raw.some((c) => !c.handoverHistory || !c.handoverStatus)) {
      setStorage("saiflow_clients", initialClients);
      return initialClients;
    }
    return raw;
  });

  const [proposals] = useState<Proposal[]>(() => {
    const raw = getStorage<Proposal[]>("saiflow_proposals", initialProposals);
    if (raw.length > 0 && (!raw[0].versions || !raw[0].proposalNo)) {
      setStorage("saiflow_proposals", initialProposals);
      return initialProposals;
    }
    return raw;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [handoverFilter, setHandoverFilter] = useState<string>("all");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // Handover modal
  const handoverModal = useModal();
  const handoverHistoryModal = useModal();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  // Handover form state
  const [handoverTeam, setHandoverTeam] = useState(HANDOVER_TEAMS[0]);
  const [handoverNotes, setHandoverNotes] = useState("");
  const [handoverItems, setHandoverItems] = useState<Record<string, boolean>>(
    Object.fromEntries(HANDOVER_ITEMS.map((item) => [item.key, true]))
  );

  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const getProposalForClient = (client: Client): Proposal | undefined => {
    if (client.latestProposalId) {
      return proposals.find((p) => p.id === client.latestProposalId);
    }
    return proposals.find((p) =>
      p.companyName.toLowerCase() === client.company.toLowerCase()
    );
  };

  const exportClientProposalPDF = (client: Client) => {
    const proposal = getProposalForClient(client);
    if (!proposal) {
      showToast("No proposal found for this client.", "error");
      return;
    }
    exportProposalToPDF(proposal);
  };

  const exportProposalToPDF = (proposal: Proposal) => {
    try {
      showToast("Generating PDF...", "info");

      const latestVer = proposal.versions?.[proposal.versions.length - 1];
      if (!latestVer) {
        showToast("No version data available.", "error");
        return;
      }

      const pdf = new jsPDF("p", "mm", "a4");
      const pw = pdf.internal.pageSize.getWidth();
      let y = 20;

      const title = (s: string) => { pdf.setFontSize(13); pdf.setFont("helvetica", "bold"); pdf.setTextColor(30, 30, 30); pdf.text(s, 14, y); y += 7; };
      const body = (s: string) => {
        pdf.setFontSize(9); pdf.setFont("helvetica", "normal"); pdf.setTextColor(60, 60, 60);
        pdf.splitTextToSize(s || "—", pw - 28).forEach((l: string) => {
          if (y > 280) { pdf.addPage(); y = 20; }
          pdf.text(l, 14, y); y += 5;
        });
      };

      // Header
      pdf.setFontSize(18); pdf.setFont("helvetica", "bold"); pdf.text("Business Proposal", pw / 2, y, { align: "center" }); y += 8;
      pdf.setFontSize(10); pdf.setFont("helvetica", "normal"); pdf.setTextColor(100, 100, 100);
      pdf.text(`${proposal.proposalNo} | ${formatDate(proposal.createdAt)}`, pw / 2, y, { align: "center" }); y += 6;
      pdf.text(`Status: ${proposal.status}`, pw / 2, y, { align: "center" }); y += 12;

      // Client Info
      title("Client Information");
      body(`Company: ${proposal.companyName}`);
      body(`Contact: ${proposal.leadName} (${proposal.leadEmail})`);
      y += 4;

      // Requirement
      title("1. Requirement");
      body(latestVer.requirement?.overview || "—");

      // Estimation
      title("2. Estimation");
      body(`Total: ${latestVer.estimation?.total ? formatCurrency(latestVer.estimation.total) : "—"}`);

      // Quotation
      title("3. Quotation / Pricing Terms");
      body(`Payment Terms: ${latestVer.quotation?.paymentTerms || "—"}`);

      // Footer
      y = 285;
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "italic");
      pdf.setTextColor(150, 150, 150);
      pdf.text(`Generated on ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} | SaiFlow CRM`, pw / 2, y, { align: "center" });

      pdf.save(`${proposal.proposalNo.replace(/\//g, "-")}.pdf`);
      showToast("PDF exported successfully!", "success");
    } catch (err) {
      console.error("PDF export error:", err);
      showToast("Failed to generate PDF.", "error");
    }
  };

  // ── Handover Logic ─────────────────────────────────────────────────────────

  const openHandoverModal = (client: Client) => {
    setSelectedClient(client);
    setSelectedProposal(getProposalForClient(client) || null);
    setHandoverTeam(HANDOVER_TEAMS[0]);
    setHandoverNotes("");
    setHandoverItems(Object.fromEntries(HANDOVER_ITEMS.map((item) => [item.key, true])));
    handoverModal.openModal();
  };

  const openHandoverHistoryModal = (client: Client) => {
    setSelectedClient(client);
    handoverHistoryModal.openModal();
  };

  const handleHandoverSubmit = () => {
    if (!selectedClient || !selectedProposal) {
      showToast("No proposal linked to this client.", "error");
      return;
    }

    const transferredData = Object.fromEntries(
      HANDOVER_ITEMS.map((item) => [item.key, !!handoverItems[item.key]])
    ) as HandoverRecord["transferredData"];

    const newRecord: HandoverRecord = {
      id: generateId(selectedClient.handoverHistory),
      handoverDate: new Date().toISOString(),
      handoverBy: "Current User",
      handoverTo: handoverTeam,
      proposalId: selectedProposal.id,
      proposalNo: selectedProposal.proposalNo,
      status: "Completed",
      notes: handoverNotes,
      transferredData,
    };

    const updated = clients.map((c) =>
      c.id === selectedClient.id
        ? {
            ...c,
            handoverStatus: "Completed" as const,
            handoverHistory: [...c.handoverHistory, newRecord],
          }
        : c
    );

    setClients(updated);
    setStorage("saiflow_clients", updated);
    showToast(`Successfully handed over to ${handoverTeam}!`, "success");
    handoverModal.closeModal();
  };

  // ── List Processing ────────────────────────────────────────────────────────

  const processedClients = useMemo(() => {
    let result = [...clients];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.company.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query) ||
          c.phone.includes(query)
      );
    }

    if (handoverFilter !== "all") {
      result = result.filter((c) => c.handoverStatus === handoverFilter);
    }

    return result;
  }, [clients, searchQuery, handoverFilter]);

  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return processedClients.slice(start, start + rowsPerPage);
  }, [processedClients, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(processedClients.length / rowsPerPage);

  // ── Render ─────────────────────────────────────────────────────────────────

  const renderHandoverStatusIcon = (status: string) => {
    switch (status) {
      case "Completed": return <FiCheckCircle className="size-3.5" />;
      case "In Progress": return <FiRefreshCw className="size-3.5" />;
      default: return <FiClock className="size-3.5" />;
    }
  };

  return (
    <>
      <PageMeta
        title="Client Management | SaiFlow"
        description="View and manage all converted clients with proposal handover tracking."
      />
      <PageBreadcrumb pageTitle="Client Management" />

      {/* Filters & Actions */}
      <div className="flex flex-col gap-3 mb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center w-full lg:w-auto">
          <div className="w-full sm:w-64">
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)}
              className="flex items-center justify-between h-11 w-44 rounded-lg border border-gray-200 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900 dark:text-white/90 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5"
            >
              <span className="truncate">{handoverFilter === "all" ? "All Handovers" : handoverFilter}</span>
              <ChevronDownIcon className="w-4 h-4 text-gray-500 shrink-0 ml-2" />
            </button>
            <Dropdown
              isOpen={isStatusFilterOpen}
              onClose={() => setIsStatusFilterOpen(false)}
              className="left-0 w-44 p-1 mt-2"
            >
              <ul className="flex flex-col gap-0.5">
                <li>
                  <DropdownItem
                    onItemClick={() => { setHandoverFilter("all"); setCurrentPage(1); setIsStatusFilterOpen(false); }}
                    className={`cursor-pointer rounded-lg text-left w-full px-3 py-2 text-sm ${handoverFilter === "all" ? "bg-brand-500 text-white font-medium" : "text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"}`}
                  >
                    All Handovers
                  </DropdownItem>
                </li>
                {(["Pending", "In Progress", "Completed"] as const).map((st) => (
                  <li key={st}>
                    <DropdownItem
                      onItemClick={() => { setHandoverFilter(st); setCurrentPage(1); setIsStatusFilterOpen(false); }}
                      className={`cursor-pointer rounded-lg text-left w-full px-3 py-2 text-sm ${handoverFilter === st ? "bg-brand-500 text-white font-medium" : "text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"}`}
                    >
                      {st}
                    </DropdownItem>
                  </li>
                ))}
              </ul>
            </Dropdown>
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <Table className="min-w-full">
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] sticky top-0 bg-white dark:bg-gray-900 z-10">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Client Name</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Company</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Contact Number</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Email</TableCell>
                <TableCell isHeader className="px-5 py-3 text-center text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Proposal Status</TableCell>
                <TableCell isHeader className="px-5 py-3 text-center text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Latest Proposal</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Conversion Date</TableCell>
                <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Assigned Employee</TableCell>
                <TableCell isHeader className="px-5 py-3 text-center text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Handover Status</TableCell>
                <TableCell isHeader className="px-5 py-3 text-end text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {paginatedClients.length > 0 ? (
                paginatedClients.map((client) => {
                  const proposal = getProposalForClient(client);
                  return (
                    <TableRow key={client.id}
                      className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Client Name */}
                      <TableCell className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold text-xs">
                            {client.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-theme-sm font-medium text-gray-800 dark:text-white/90">{client.name}</div>
                            <div className="text-xs text-gray-400">{client.designation || "—"}</div>
                          </div>
                        </div>
                      </TableCell>
                      {/* Company */}
                      <TableCell className="px-5 py-4 whitespace-nowrap">
                        <div className="text-theme-sm font-medium text-gray-800 dark:text-white/90">{client.company}</div>
                        <div className="text-xs text-gray-400">{client.industry || "—"}</div>
                      </TableCell>
                      {/* Contact Number */}
                      <TableCell className="px-5 py-4 whitespace-nowrap text-theme-sm text-gray-700 dark:text-gray-400">
                        {client.phone}
                      </TableCell>
                      {/* Email */}
                      <TableCell className="px-5 py-4 whitespace-nowrap text-theme-sm text-gray-700 dark:text-gray-400">
                        {client.email}
                      </TableCell>
                      {/* Proposal Status */}
                      <TableCell className="px-5 py-4 whitespace-nowrap text-center">
                        {proposal ? (
                          <Badge size="sm" color={PROPOSAL_STATUS_COLORS[proposal.status] || "light"}>
                            {proposal.status}
                          </Badge>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </TableCell>
                      {/* Latest Proposal PDF */}
                      <TableCell className="px-5 py-4 whitespace-nowrap text-center">
                        {proposal ? (
                          <button
                            onClick={() => exportClientProposalPDF(client)}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 cursor-pointer bg-brand-50 dark:bg-brand-900/20 px-2.5 py-1 rounded-lg hover:bg-brand-100 dark:hover:bg-brand-900/30 transition-colors"
                            title="Download Proposal PDF"
                          >
                            <FiDownload className="size-3" />
                            {proposal.proposalNo}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </TableCell>
                      {/* Conversion Date */}
                      <TableCell className="px-5 py-4 whitespace-nowrap">
                        {client.conversionDate ? (
                          <div className="flex items-center gap-1.5 text-theme-sm text-gray-700 dark:text-gray-400">
                            <FiCalendar className="size-3.5 text-gray-400" />
                            {formatDate(client.conversionDate)}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </TableCell>
                      {/* Assigned Employee */}
                      <TableCell className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                            <FiUser className="size-3" />
                          </div>
                          <span className="text-theme-sm text-gray-700 dark:text-gray-400">
                            {client.assignedEmployee || client.relationshipManager || "—"}
                          </span>
                        </div>
                      </TableCell>
                      {/* Handover Status */}
                      <TableCell className="px-5 py-4 whitespace-nowrap text-center">
                        <Badge size="sm" color={HANDOVER_STATUS_COLORS[client.handoverStatus] || "warning"}>
                          <span className="flex items-center gap-1">
                            {renderHandoverStatusIcon(client.handoverStatus)}
                            {client.handoverStatus}
                          </span>
                        </Badge>
                      </TableCell>
                      {/* Actions */}
                      <TableCell className="px-5 py-4 whitespace-nowrap text-end">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => navigate(`/clients/${client.id}`)}
                            className="p-1.5 text-gray-500 hover:text-brand-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition"
                            title="View Details"
                          >
                            <FiEye className="size-4" />
                          </button>
                          <button
                            onClick={() => exportClientProposalPDF(client)}
                            className="p-1.5 text-gray-500 hover:text-cyan-600 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition"
                            title="Download Proposal PDF"
                          >
                            <FiDownload className="size-4" />
                          </button>
                          <button
                            onClick={() => openHandoverModal(client)}
                            disabled={client.handoverStatus === "Completed"}
                            className={`p-1.5 rounded-lg transition ${
                              client.handoverStatus === "Completed"
                                ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                                : "text-gray-500 hover:text-green-600 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer"
                            }`}
                            title="Handover to Development Team"
                          >
                            <FiShield className="size-4" />
                          </button>
                          {client.handoverHistory.length > 0 && (
                            <button
                              onClick={() => openHandoverHistoryModal(client)}
                              className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition"
                              title="View Handover History"
                            >
                              <FiClock className="size-4" />
                            </button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <FiUsers className="size-10 text-gray-300 dark:text-gray-600" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">No clients found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {processedClients.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={processedClients.length}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
          onRowsPerPageChange={(rows) => { setRowsPerPage(rows); setCurrentPage(1); }}
          itemName="clients"
        />
      )}

      {/* ── Handover Modal ─────────────────────────────────────────────────── */}
      <Modal isOpen={handoverModal.isOpen} onClose={handoverModal.closeModal} className="max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/[0.05] pb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                <FiShield className="size-5 text-brand-500" />
                Handover to Development Team
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Transfering: {selectedClient?.company} — {selectedProposal?.proposalNo}
              </p>
            </div>
          </div>

          {/* Client & Proposal Summary */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 dark:bg-white/[0.03] rounded-lg">
            <div>
              <span className="text-xs text-gray-400 block">Client</span>
              <span className="text-sm font-medium text-gray-800 dark:text-white">{selectedClient?.name}</span>
            </div>
            <div>
              <span className="text-xs text-gray-400 block">Company</span>
              <span className="text-sm font-medium text-gray-800 dark:text-white">{selectedClient?.company}</span>
            </div>
            <div>
              <span className="text-xs text-gray-400 block">Proposal</span>
              <span className="text-sm font-medium text-gray-800 dark:text-white">{selectedProposal?.proposalNo}</span>
            </div>
            <div>
              <span className="text-xs text-gray-400 block">Proposal Status</span>
              <span className="text-sm font-medium">
                {selectedProposal && (
                  <Badge size="sm" color={PROPOSAL_STATUS_COLORS[selectedProposal.status] || "light"}>
                    {selectedProposal.status}
                  </Badge>
                )}
              </span>
            </div>
          </div>

          {/* Handover Items */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-gray-500 dark:text-gray-400">
              Select items to transfer
            </label>
            <div className="grid grid-cols-2 gap-2">
              {HANDOVER_ITEMS.map((item) => (
                <label key={item.key}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={!!handoverItems[item.key]}
                    onChange={(e) => setHandoverItems({ ...handoverItems, [item.key]: e.target.checked })}
                    className="rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                  />
                  <div className="flex items-center gap-2">
                    {item.key === "clientDetails" && <FiUser className="size-3.5 text-gray-400" />}
                    {item.key === "leadDetails" && <FiTrendingUp className="size-3.5 text-gray-400" />}
                    {item.key === "requirement" && <FiFileText className="size-3.5 text-gray-400" />}
                    {item.key === "estimation" && <FiFileText className="size-3.5 text-gray-400" />}
                    {item.key === "quotation" && <FiFileText className="size-3.5 text-gray-400" />}
                    {item.key === "approvedProposalPdf" && <FiDownload className="size-3.5 text-gray-400" />}
                    {item.key === "summary" && <FiFileText className="size-3.5 text-gray-400" />}
                    {item.key === "notes" && <FiFileText className="size-3.5 text-gray-400" />}
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Handover Team */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">Handover to Team</label>
            <select
              value={handoverTeam}
              onChange={(e) => setHandoverTeam(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-800 dark:text-white/90 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              {HANDOVER_TEAMS.map((team) => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500 dark:text-gray-400">Handover Notes</label>
            <textarea
              value={handoverNotes}
              onChange={(e) => setHandoverNotes(e.target.value)}
              placeholder="Add any additional notes for the development team..."
              className="w-full rounded-lg border border-gray-200 bg-transparent px-4 py-2.5 text-sm text-gray-800 dark:border-gray-800 dark:text-white/90 resize-none h-24 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-white/[0.05]">
            <Button onClick={handoverModal.closeModal} variant="outline" size="sm">Cancel</Button>
            <Button onClick={handleHandoverSubmit} variant="primary" size="sm" startIcon={<FiShield />}>
              Confirm Handover
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Handover History Modal ──────────────────────────────────────────── */}
      <Modal isOpen={handoverHistoryModal.isOpen} onClose={handoverHistoryModal.closeModal} className="max-w-2xl p-6 max-h-[80vh] overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/[0.05] pb-3">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <FiClock className="size-5 text-brand-500" />
              Handover History
            </h3>
            <span className="text-xs text-gray-400">{selectedClient?.company}</span>
          </div>

          {selectedClient && selectedClient.handoverHistory.length > 0 ? (
            <div className="relative pl-8 space-y-4">
              {[...selectedClient.handoverHistory].reverse().map((record) => (
                <div key={record.id} className="relative">
                  <div className="absolute left-[-20px] top-4 bottom-0 w-0.5 bg-gray-100 dark:bg-gray-800" />
                  <div className="absolute left-[-25px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-400 dark:bg-emerald-600" />
                  <div className="p-4 rounded-lg border border-gray-100 dark:border-white/[0.05] hover:bg-gray-50 dark:hover:bg-white/[0.02] transition">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-800 dark:text-white">
                          Handover to {record.handoverTo}
                        </span>
                        <Badge size="sm" color={HANDOVER_STATUS_COLORS[record.status] || "warning"}>
                          {record.status}
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-400">{formatDate(record.handoverDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                      <FiUser className="size-3" /> {record.handoverBy}
                      <FiFileText className="size-3 ml-1" /> {record.proposalNo}
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {(Object.entries(record.transferredData) as [keyof HandoverRecord["transferredData"], boolean][])
                        .filter(([, val]) => val)
                        .map(([key]) => (
                          <span key={key} className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                            <FiCheckCircle className="size-2.5" />
                            {HANDOVER_ITEMS.find((i) => i.key === key)?.label || key}
                          </span>
                        ))}
                    </div>
                    {record.notes && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-1 border-t border-gray-50 dark:border-white/[0.03] pt-2">
                        "{record.notes}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <FiClock className="size-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No handovers recorded yet.</p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
