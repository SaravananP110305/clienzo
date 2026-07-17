import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { getStorage, setStorage } from "../../../utils/storage";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Badge from "../../../components/ui/badge/Badge";
import Input from "../../../components/form/input/InputField";
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
  FiCalendar,
  FiUser,
} from "react-icons/fi";
import { useToast } from "../../../hooks/useToast";
import { Client, initialClients } from "../data/clientsData";
import { Proposal, initialProposals } from "../../Quotation/data/quotationsData";
import { exportProposalToPDF } from "../../Quotation/pages/QuotationList";

// ─── Constants ──────────────────────────────────────────────────────────────

const PROPOSAL_STATUS_COLORS: Record<string, "primary" | "success" | "error" | "warning" | "info" | "light" | "dark"> = {
  Draft: "light",
  Sent: "info",
  "Under Review": "warning",
  Negotiation: "warning",
  Approved: "success",
  Rejected: "error",
  Converted: "primary",
};

const HANDOVER_STATUS_COLORS: Record<string, "warning" | "success"> = {
  Pending: "warning",
  Onboarded: "success",
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}



// ─── Main Component ─────────────────────────────────────────────────────────

export default function ClientList() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // ── State ──────────────────────────────────────────────────────────────────
  const [clients, setClients] = useState<Client[]>(() => {
    const raw = getStorage<Client[]>("saiflow_clients", initialClients);
    if (raw.length > 0 && raw.some((c) => c.handoverStatus !== "Pending" && c.handoverStatus !== "Onboarded")) {
      setStorage("saiflow_clients", initialClients);
      return initialClients;
    }
    return raw;
  });

  const [proposals] = useState<Proposal[]>(() => {
    const raw = getStorage<Proposal[]>("saiflow_proposals", initialProposals);
    if (raw.length > 0 && (!raw[0].requirement || !raw[0].proposalNo)) {
      setStorage("saiflow_proposals", initialProposals);
      return initialProposals;
    }
    return raw;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [handoverFilter, setHandoverFilter] = useState<string>("all");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);



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
    exportProposalToPDF(proposal, showToast);
  };

  // ── Onboarding / Handover Toggle ───────────────────────────────────────────

  const toggleOnboardingStatus = (client: Client) => {
    const newStatus = client.handoverStatus === "Onboarded" ? "Pending" : "Onboarded";
    const updated = clients.map((c) =>
      c.id === client.id
        ? {
            ...c,
            handoverStatus: newStatus as "Pending" | "Onboarded",
          }
        : c
    );
    setClients(updated);
    setStorage("saiflow_clients", updated);
    showToast(`Client "${client.company}" status updated to ${newStatus}`, "success");
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
      case "Onboarded": return <FiCheckCircle className="size-3.5" />;
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
              <span className="truncate">{handoverFilter === "all" ? "All Onboarding" : handoverFilter}</span>
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
                    All Onboarding
                  </DropdownItem>
                </li>
                {(["Pending", "Onboarded"] as const).map((st) => (
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
                            onClick={() => toggleOnboardingStatus(client)}
                            className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition cursor-pointer"
                            title={client.handoverStatus === "Onboarded" ? "Mark Pending" : "Mark Onboarded"}
                          >
                            <FiShield className="size-4" />
                          </button>
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


    </>
  );
}
