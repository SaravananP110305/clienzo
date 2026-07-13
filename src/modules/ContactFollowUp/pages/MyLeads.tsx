import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
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
import { ChevronDownIcon, ChevronUpIcon } from "../../../icons";
import {
  FiPhone,
  FiEye,
  FiCheckCircle,
  FiClock,
  FiXCircle,
} from "react-icons/fi";
import { getStatusColor, getPriorityColor, LEAD_STATUSES, ASSIGNEES, type Lead, initialLeads } from "../../LeadManagement/data/leadsData";
import { getStorage, setStorage } from "../../../utils/storage";
import { useToast } from "../../../hooks/useToast";
import { Modal } from "../../../components/ui/modal";
import { useModal } from "../../../hooks/useModal";
import Button from "../../../components/ui/button/Button";


export default function MyLeads() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [leads, setLeads] = useState<Lead[]>(() => getStorage<Lead[]>("saiflow_leads", initialLeads));

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Lead>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [isAssigneeOpen, setIsAssigneeOpen] = useState(false);

  type ContactResult = "Interested" | "Call Later" | "Not Interested";

  const contactModal = useModal();
  const successModal = useModal();
  const [selectedLeadForContact, setSelectedLeadForContact] = useState<Lead | null>(null);
  const [contactResult, setContactResult] = useState<ContactResult | null>(null);
  const [contactSummary, setContactSummary] = useState("");
  const [savedOutcome, setSavedOutcome] = useState<string | null>(null);
  const [callLaterDate, setCallLaterDate] = useState("");
  const [callLaterTime, setCallLaterTime] = useState("");

  const handleOpenContactModal = (lead: Lead) => {
    setSelectedLeadForContact(lead);
    setContactResult(null);
    setContactSummary("");
    setCallLaterDate("");
    setCallLaterTime("");
    contactModal.openModal();
  };

  const handleSaveContactOutcome = () => {
    if (!selectedLeadForContact) return;

    if (!contactSummary.trim()) {
      showToast("Please enter a summary.", "error");
      return;
    }

    let newStatus: string;
    let outcomeMessage: string;

    if (contactResult === "Interested") {
      newStatus = "Qualified";
      outcomeMessage = "Marked as Interested";
    } else if (contactResult === "Call Later") {
      newStatus = "Contacted";
      outcomeMessage = "Follow-up scheduled";
    } else if (contactResult === "Not Interested") {
      newStatus = "Lost";
      outcomeMessage = "Marked as Not Interested";
    } else {
      return;
    }

    // Update the lead in storage
    const summaryNote = contactSummary
      ? `[Contact] ${contactResult}: ${contactSummary}`
      : `[Contact] ${contactResult}`;
    const updatedLeads = leads.map((l) => {
      if (l.id === selectedLeadForContact.id) {
        return {
          ...l,
          status: newStatus as any,
          notes: l.notes ? `${l.notes}\n${summaryNote}` : summaryNote
        };
      }
      return l;
    });
    setLeads(updatedLeads);
    setStorage("saiflow_leads", updatedLeads);

    // If Call Later, create a follow-up meeting
    if (contactResult === "Call Later" && callLaterDate) {
      const meetingsList = getStorage<any[]>("saiflow_meetings", []);
      const newMeetingId = meetingsList.length > 0 ? Math.max(...meetingsList.map(m => m.id)) + 1 : 1;
      const newMeeting = {
        id: newMeetingId,
        leadId: selectedLeadForContact.id,
        company: selectedLeadForContact.company,
        contactPerson: selectedLeadForContact.contactPerson,
        subject: "Follow-up Call",
        date: callLaterDate,
        time: callLaterTime || "12:00",
        type: "Phone Call",
        status: "Scheduled",
        notes: contactSummary,
        linkOrLocation: selectedLeadForContact.phone
      };
      const updatedMeetings = [...meetingsList, newMeeting];
      setStorage("saiflow_meetings", updatedMeetings);
    }

    setSavedOutcome(outcomeMessage);
    showToast("Contact outcome saved successfully.", "success");
    contactModal.closeModal();
    successModal.openModal();
  };

  const statusOptions = [
    { value: "all", label: "All statuses" },
    ...LEAD_STATUSES.map((s) => ({ value: s, label: s })),
  ];

  const handleSort = (field: keyof Lead) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

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
          l.status.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((l) => l.status === statusFilter);
    }

    if (assigneeFilter !== "all") {
      result = result.filter((l) => l.assignedTo === assigneeFilter);
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
  }, [searchQuery, statusFilter, assigneeFilter, sortField, sortOrder]);

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
        title="All Leads | SaiFlow"
        description="View and contact all leads in SaiFlow CRM."
      />
      <PageBreadcrumb pageTitle="All Leads" />

      {/* Control Panel */}
      <div className="flex flex-col gap-4 mb-4 lg:flex-row lg:items-center lg:justify-between">
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
              onClick={() => {
                setIsStatusOpen(!isStatusOpen);
                setIsAssigneeOpen(false);
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

          <div className="relative">
            <button
              onClick={() => {
                setIsAssigneeOpen(!isAssigneeOpen);
                setIsStatusOpen(false);
              }}
              className="flex items-center justify-between h-11 w-40 rounded-lg border border-gray-200 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 cursor-pointer dropdown-toggle hover:bg-gray-50 dark:hover:bg-white/5"
            >
              <span className="truncate">
                {assigneeFilter === "all" ? "All assignees" : assigneeFilter}
              </span>
              <ChevronDownIcon className="w-4 h-4 text-gray-500 shrink-0 ml-1" />
            </button>
            <Dropdown
              isOpen={isAssigneeOpen}
              onClose={() => setIsAssigneeOpen(false)}
              className="left-0 right-auto w-44 p-1 mt-2"
            >
              <ul className="flex flex-col gap-0.5">
                {[{ value: "all", label: "All assignees" }, ...ASSIGNEES.map((a) => ({ value: a, label: a }))].map((opt) => (
                  <li key={opt.value}>
                    <DropdownItem
                      onItemClick={() => {
                        setAssigneeFilter(opt.value);
                        setCurrentPage(1);
                        setIsAssigneeOpen(false);
                      }}
                      className={`cursor-pointer rounded-lg text-left w-full px-3 py-2 text-sm ${
                        assigneeFilter === opt.value
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

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto custom-scrollbar">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] sticky top-0 bg-white dark:bg-gray-900 z-10">
              <TableRow>
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
                      {lead.phone}
                    </TableCell>
                    <TableCell className="px-5 py-4 whitespace-nowrap">
                      <Badge size="sm" color={getStatusColor(lead.status)}>
                        {lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 whitespace-nowrap">
                      <Badge size="sm" color={getPriorityColor(lead.priority)}>
                        {lead.priority || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-theme-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {lead.assignedTo}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/contacts/${lead.id}`)}
                            title="View details"
                            className="flex items-center justify-center h-8 w-8 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/5 transition cursor-pointer"
                          >
                            <FiEye className="size-4" />
                          </button>
                          <button
                            onClick={() => handleOpenContactModal(lead)}
                            title="Contact"
                            className="flex items-center justify-center h-8 w-8 rounded-lg bg-brand-500 text-white hover:bg-brand-600 transition cursor-pointer"
                          >
                            <FiPhone className="size-4" />
                          </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No leads found.
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
            onRowsPerPageChange={(rows) => { setRowsPerPage(rows); setCurrentPage(1); }}
            itemName="leads"
          />
        )}
      </div>

      {/* Contact Outcome Modal */}
      <Modal isOpen={contactModal.isOpen} onClose={contactModal.closeModal} className="max-w-[500px] m-4">
        <div className="relative w-full rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
          {/* Step 1: Select outcome */}
          {contactResult === null && (
            <>
              <div className="pr-10 border-b border-gray-150 pb-4 mb-6 dark:border-gray-800">
                <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                  Log contact outcome
                </h4>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Select the client response after the communication attempt:
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setContactResult("Interested")}
                  className="flex items-center justify-between w-full rounded-xl border border-gray-200 px-4 py-3.5 hover:bg-success-50 dark:hover:bg-success-500/10 hover:border-success-500 transition text-left cursor-pointer group"
                >
                  <div>
                    <span className="block text-sm font-semibold text-gray-800 dark:text-white/90 group-hover:text-success-600 dark:group-hover:text-success-400">
                      Interested
                    </span>
                    <span className="block text-xs text-gray-400 mt-0.5">
                      Client is interested, mark lead as Qualified.
                    </span>
                  </div>
                  <FiCheckCircle className="size-5 text-gray-300 group-hover:text-success-500 transition" />
                </button>

                <button
                  onClick={() => setContactResult("Call Later")}
                  className="flex items-center justify-between w-full rounded-xl border border-gray-200 px-4 py-3.5 hover:bg-warning-50 dark:hover:bg-warning-500/10 hover:border-warning-500 transition text-left cursor-pointer group"
                >
                  <div>
                    <span className="block text-sm font-semibold text-gray-800 dark:text-white/90 group-hover:text-warning-600 dark:group-hover:text-warning-400">
                      Call Later
                    </span>
                    <span className="block text-xs text-gray-400 mt-0.5">
                      Client is busy, schedule a callback follow-up.
                    </span>
                  </div>
                  <FiClock className="size-5 text-gray-300 group-hover:text-warning-500 transition" />
                </button>

                <button
                  onClick={() => setContactResult("Not Interested")}
                  className="flex items-center justify-between w-full rounded-xl border border-gray-200 px-4 py-3.5 hover:bg-error-50 dark:hover:bg-error-500/10 hover:border-error-500 transition text-left cursor-pointer group"
                >
                  <div>
                    <span className="block text-sm font-semibold text-gray-800 dark:text-white/90 group-hover:text-error-600 dark:group-hover:text-error-400">
                      Not Interested
                    </span>
                    <span className="block text-xs text-gray-400 mt-0.5">
                      Client declined interest, provide reason details.
                    </span>
                  </div>
                  <FiXCircle className="size-5 text-gray-300 group-hover:text-error-500 transition" />
                </button>
              </div>
            </>
          )}

          {/* Step 2: Summary + confirm */}
          {contactResult !== null && (
            <>
              <div className="pr-10 border-b border-gray-150 pb-4 mb-6 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  {contactResult === "Interested" && <FiCheckCircle className="size-5 text-success-500" />}
                  {contactResult === "Call Later" && <FiClock className="size-5 text-warning-500" />}
                  {contactResult === "Not Interested" && <FiXCircle className="size-5 text-error-500" />}
                  <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                    {contactResult === "Interested" && "Interested"}
                    {contactResult === "Call Later" && "Schedule follow-up"}
                    {contactResult === "Not Interested" && "Not interested"}
                  </h4>
                </div>
              </div>

              <div className="space-y-4">
                {/* Summary field */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Summary <span className="text-error-500">*</span>
                  </label>
                  <textarea
                    value={contactSummary}
                    onChange={(e) => setContactSummary(e.target.value)}
                    placeholder={
                      contactResult === "Interested"
                        ? "Describe what the client was interested in..."
                        : contactResult === "Call Later"
                        ? "Why does the client need more time?..."
                        : "Provide reason details for declining..."
                    }
                    className="w-full min-h-[100px] rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  />
                </div>

                {/* Call Later extra fields */}
                {contactResult === "Call Later" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Follow-up date
                      </label>
                      <Input
                        type="date"
                        value={callLaterDate}
                        onChange={(e) => setCallLaterDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Follow-up time
                      </label>
                      <Input
                        type="time"
                        value={callLaterTime}
                        onChange={(e) => setCallLaterTime(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-white/[0.05]">
                <Button size="sm" variant="outline" onClick={() => setContactResult(null)}>
                  Back
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveContactOutcome}
                >
                  Save
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Success Confirmation Modal */}
      <Modal isOpen={successModal.isOpen} onClose={successModal.closeModal} className="max-w-[400px] m-4">
        <div className="relative w-full rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-50 dark:bg-success-500/10 mb-4">
            <FiCheckCircle className="size-7 text-success-600 dark:text-success-400" />
          </div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">Result saved</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{savedOutcome}</p>
          <Button size="sm" onClick={successModal.closeModal} className="w-full">
            Done
          </Button>
        </div>
      </Modal>
    </>
  );
}
