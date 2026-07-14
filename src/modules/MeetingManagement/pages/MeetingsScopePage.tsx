import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import { Dropdown } from "../../../components/ui/dropdown/Dropdown";
import { DropdownItem } from "../../../components/ui/dropdown/DropdownItem";
import { Pagination } from "../../../components/ui/pagination/Pagination";
import { Modal } from "../../../components/ui/modal";
import { useModal } from "../../../hooks/useModal";
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
import { FiEye, FiEdit, FiTrash2, FiPlus, FiCalendar, FiClock, FiBriefcase, FiUser } from "react-icons/fi";
import { useToast } from "../../../hooks/useToast";
import { Meeting } from "../data/meetingsData";
import { Lead, initialLeads } from "../../LeadManagement/data/leadsData";
import { LOST_REASONS } from "../../Master/data/masterData";
import { getStorage, setStorage } from "../../../utils/storage";
import Select from "../../../components/form/Select";

interface MeetingsScopePageProps {
  meetings: Meeting[];
  onDeleteMeeting: (id: number) => void;
  onUpdateMeetingStatus?: (id: number, status: Meeting["status"]) => void;
}

type TabType = "upcoming" | "today" | "completed";

export default function MeetingsScopePage({
  meetings,
  onDeleteMeeting,
  onUpdateMeetingStatus,
}: MeetingsScopePageProps) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const deleteModal = useModal();

  const [activeTab, setActiveTab] = useState<TabType>("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortField, setSortField] = useState<keyof Meeting>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Dropdown open states
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  // Selected meeting for delete
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  // Outcome modal state
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);
  const [pendingOutcomeMeeting, setPendingOutcomeMeeting] = useState<Meeting | null>(null);
  const [outcomeType, setOutcomeType] = useState<"Won" | "Lost" | null>(null);
  const [outcomeSummary, setOutcomeSummary] = useState("");
  const [outcomeLostReason, setOutcomeLostReason] = useState("");
  const [outcomeNextAction, setOutcomeNextAction] = useState("Create Follow-up");

  const [viewMode, setViewMode] = useState<"table" | "calendar" | "kanban">("table");
  const [kanbanPages, setKanbanPages] = useState<Record<string, number>>({
    Scheduled: 1,
    Rescheduled: 1,
    Completed: 1,
    Cancelled: 1,
  });
  const [currentMonth, setCurrentMonth] = useState(6); // 0-indexed, July
  const [currentYear, setCurrentYear] = useState(2026);

  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const startDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const calendarCells = useMemo(() => {
    const cells = [];
    const totalDays = daysInMonth(currentMonth, currentYear);
    const startDay = startDayOfMonth(currentMonth, currentYear);

    // Prev month days
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const prevMonthDays = daysInMonth(prevMonth, prevYear);
    for (let i = startDay - 1; i >= 0; i--) {
      cells.push({
        day: prevMonthDays - i,
        month: prevMonth,
        year: prevYear,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      cells.push({
        day: i,
        month: currentMonth,
        year: currentYear,
        isCurrentMonth: true,
      });
    }

    // Next month days to pad to a multiple of 7
    const remaining = 42 - cells.length; // 6 rows of 7 days
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    for (let i = 1; i <= remaining; i++) {
      cells.push({
        day: i,
        month: nextMonth,
        year: nextYear,
        isCurrentMonth: false,
      });
    }

    return cells;
  }, [currentMonth, currentYear]);

  const getCellMeetings = (cell: { day: number; month: number; year: number }) => {
    const formattedMonth = String(cell.month + 1).padStart(2, "0");
    const formattedDay = String(cell.day).padStart(2, "0");
    const cellDateStr = `${cell.year}-${formattedMonth}-${formattedDay}`;
    return meetings.filter((m) => m.date === cellDateStr);
  };

  const getMeetingStatusColor = (status: Meeting["status"]) => {
    switch (status) {
      case "Scheduled":
        return "bg-brand-500 text-white";
      case "Completed":
        return "bg-success-500 text-white";
      case "Cancelled":
        return "bg-error-500 text-white";
      case "Rescheduled":
        return "bg-warning-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const handleOpenDelete = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    deleteModal.openModal();
  };

  const handleDeleteConfirm = () => {
    if (selectedMeeting) {
      onDeleteMeeting(selectedMeeting.id);
      showToast(`Meeting "${selectedMeeting.subject}" deleted successfully.`, "success");
    }
    deleteModal.closeModal();
  };

  const handleStatusChange = (meetingId: number, newStatus: Meeting["status"]) => {
    // Intercept 'Completed' to show outcome modal
    if (newStatus === "Completed") {
      const meeting = meetings.find(m => m.id === meetingId);
      if (meeting) {
        setPendingOutcomeMeeting(meeting);
        setOutcomeType(null);
        setOutcomeSummary("");
        setOutcomeLostReason("");
        setOutcomeNextAction("Create Follow-up");
        setShowOutcomeModal(true);
      }
      return;
    }
    // For non-Completed statuses, update directly
    if (onUpdateMeetingStatus) {
      onUpdateMeetingStatus(meetingId, newStatus);
      showToast(`Meeting status updated to "${newStatus}" successfully.`, "success");
    }
  };

  const handleConfirmOutcome = () => {
    if (!pendingOutcomeMeeting || !outcomeType) return;

    // 1. Update meeting to Completed
    if (onUpdateMeetingStatus) {
      onUpdateMeetingStatus(pendingOutcomeMeeting.id, "Completed");
    }

    // 2. Find matching lead and update its status (directly, no extra confirmation)
    const allLeads = getStorage<Lead[]>("saiflow_leads", initialLeads);
    let matchingLead: Lead | undefined;
    if (pendingOutcomeMeeting.relatedToType === "Lead" && pendingOutcomeMeeting.relatedToId) {
      matchingLead = allLeads.find((l) => l.id === pendingOutcomeMeeting.relatedToId);
    } else {
      matchingLead = allLeads.find((l) => l.company.toLowerCase() === pendingOutcomeMeeting.company.toLowerCase());
    }

    if (matchingLead) {
      const summaryText = outcomeSummary || "No details provided.";
      const remarksSuffix = outcomeType === "Lost"
        ? `[Meeting Lost Outcome]: ${summaryText} (Reason: ${outcomeLostReason})`
        : `[Meeting Won Outcome]: ${summaryText}`;

      const updatedLeads = allLeads.map((l) =>
        l.id === matchingLead!.id
          ? {
              ...l,
              status: outcomeType as Lead["status"],
              remarks: `${l.remarks || ""}\n${remarksSuffix}`.trim()
            }
          : l
      );
      setStorage("saiflow_leads", updatedLeads);
    }

    showToast(`Meeting marked as Completed (${outcomeType})!`, outcomeType === "Won" ? "success" : "error");
    setShowOutcomeModal(false);
    setPendingOutcomeMeeting(null);
    setOutcomeType(null);
    setOutcomeSummary("");
    setOutcomeLostReason("");
    setOutcomeNextAction("Create Follow-up");
  };

  const handleSort = (field: keyof Meeting) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const tabCounts = useMemo(() => {
    const todayStr = "2026-07-09";
    return {
      upcoming: meetings.filter(m => m.date > todayStr && m.status !== "Completed" && m.status !== "Cancelled").length,
      today: meetings.filter(m => m.date === todayStr).length,
      completed: meetings.filter(m => m.date < todayStr || m.status === "Completed" || m.status === "Cancelled").length,
    };
  }, [meetings]);

  // Scope filter: filter actual list based on today's simulated date: 2026-07-09
  const scopedMeetings = useMemo(() => {
    const todayStr = "2026-07-09";
    return meetings.filter((meeting) => {
      if (activeTab === "today") {
        return meeting.date === todayStr;
      }
      if (activeTab === "upcoming") {
        return meeting.date > todayStr && meeting.status !== "Completed" && meeting.status !== "Cancelled";
      }
      if (activeTab === "completed") {
        return meeting.date < todayStr || meeting.status === "Completed" || meeting.status === "Cancelled";
      }
      return true;
    });
  }, [meetings, activeTab]);

  // Process data (Search, Status Filter, Sort)
  const processedMeetings = useMemo(() => {
    let result = [...scopedMeetings];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.subject.toLowerCase().includes(q) ||
          m.company.toLowerCase().includes(q) ||
          m.contactPerson.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((m) => m.status === statusFilter);
    }

    // Sort
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
  }, [scopedMeetings, searchQuery, statusFilter, sortField, sortOrder]);

  // Paginated items
  const paginatedMeetings = useMemo(() => {
    const startIdx = (currentPage - 1) * rowsPerPage;
    return processedMeetings.slice(startIdx, startIdx + rowsPerPage);
  }, [processedMeetings, currentPage, rowsPerPage]);

  const totalItems = processedMeetings.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  const statusOptions = [
    { value: "all", label: "All statuses" },
    { value: "Scheduled", label: "Scheduled" },
    { value: "Completed", label: "Completed" },
    { value: "Cancelled", label: "Cancelled" },
    { value: "Rescheduled", label: "Rescheduled" },
  ];

  const renderSortHeader = (label: string, field: keyof Meeting) => {
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchQuery("");
    setStatusFilter("all");
  };

  return (
    <>
      <PageMeta
        title="Meetings | SaiFlow"
        description="View and manage meetings in SaiFlow CRM."
      />
      <PageBreadcrumb pageTitle="Meetings" />


      {/* Modern Premium Tabs Control Header */}
      <div className="flex border-b border-gray-200 dark:border-white/[0.05] mb-6">
        <button
          onClick={() => handleTabChange("upcoming")}
          className={`pb-3 text-sm font-medium px-4 border-b-2 transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${activeTab === "upcoming"
              ? "border-brand-500 text-brand-500 font-semibold"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
        >
          Upcoming Meetings
          <span className="rounded-full px-2 py-0.5 text-xs bg-gray-100 text-gray-600 dark:bg-white/[0.08] dark:text-gray-400">
            {tabCounts.upcoming}
          </span>
        </button>
        <button
          onClick={() => handleTabChange("today")}
          className={`pb-3 text-sm font-medium px-4 border-b-2 transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${activeTab === "today"
              ? "border-brand-500 text-brand-500 font-semibold"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
        >
          Today's Meetings
          <span className="rounded-full px-2 py-0.5 text-xs bg-gray-100 text-gray-600 dark:bg-white/[0.08] dark:text-gray-400">
            {tabCounts.today}
          </span>
        </button>
        <button
          onClick={() => handleTabChange("completed")}
          className={`pb-3 text-sm font-medium px-4 border-b-2 transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${activeTab === "completed"
              ? "border-brand-500 text-brand-500 font-semibold"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
        >
          Completed Meetings
          <span className="rounded-full px-2 py-0.5 text-xs bg-gray-100 text-gray-600 dark:bg-white/[0.08] dark:text-gray-400">
            {tabCounts.completed}
          </span>
        </button>
      </div>

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
              onClick={() => setIsStatusOpen(!isStatusOpen)}
              className="flex items-center justify-between h-11 w-40 rounded-lg border border-gray-202 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 cursor-pointer dropdown-toggle hover:bg-gray-50 dark:hover:bg-white/5"
            >
              <span className="truncate">
                {statusOptions.find((o) => o.value === statusFilter)?.label}
              </span>
              <ChevronDownIcon className="w-4 h-4 text-gray-555 shrink-0 ml-1" />
            </button>
            <Dropdown
              isOpen={isStatusOpen}
              onClose={() => setIsStatusOpen(false)}
              className="left-0 right-auto w-40 p-1 mt-2"
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
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5 dark:border-white/[0.05] dark:bg-white/[0.02] h-11 items-center">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-gray-800 shadow-xs dark:bg-gray-800 dark:text-white"
                  : "text-gray-500 hover:text-gray-800 dark:hover:text-white"
              }`}
            >
              Table
            </button>
            <button
              type="button"
              onClick={() => setViewMode("calendar")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                viewMode === "calendar"
                  ? "bg-white text-gray-800 shadow-xs dark:bg-gray-800 dark:text-white"
                  : "text-gray-500 hover:text-gray-800 dark:hover:text-white"
              }`}
            >
              Calendar
            </button>
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                viewMode === "kanban"
                  ? "bg-white text-gray-800 shadow-xs dark:bg-gray-800 dark:text-white"
                  : "text-gray-500 hover:text-gray-800 dark:hover:text-white"
              }`}
            >
              Kanban
            </button>
          </div>
          <Button
            size="sm"
            onClick={() => navigate("/meetings/add")}
            startIcon={<FiPlus className="size-4" />}
            className="w-full sm:w-auto h-11 px-4 py-2.5"
          >
            Add meeting
          </Button>
        </div>
      </div>

      {/* Conditional View Rendering */}
      {viewMode === "table" ? (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto custom-scrollbar">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] sticky top-0 bg-white dark:bg-gray-900 z-10">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {renderSortHeader("S.No", "id")}
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {renderSortHeader("Subject", "subject")}
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {renderSortHeader("Company", "company")}
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {renderSortHeader("Contact person", "contactPerson")}
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {renderSortHeader("Date", "date")}
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {renderSortHeader("Time", "time")}
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {renderSortHeader("Meeting type", "type")}
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {renderSortHeader("Status", "status")}
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    Action
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {paginatedMeetings.length > 0 ? (
                  paginatedMeetings.map((meeting) => (
                    <TableRow
                      key={meeting.id}
                      className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-800 dark:text-white/90">
                        {meeting.id}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm font-medium text-gray-800 dark:text-white/90 whitespace-nowrap">
                        {meeting.subject}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {meeting.company}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {meeting.contactPerson}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {formatDate(meeting.date)}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {meeting.time}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {meeting.type}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm whitespace-nowrap">
                        {activeTab === "completed" ? (
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getMeetingStatusColor(meeting.status)}`}>
                            {meeting.status}
                          </span>
                        ) : (
                          <select
                            value={meeting.status}
                            onChange={(e) => handleStatusChange(meeting.id, e.target.value as Meeting["status"])}
                            className="h-9 w-32 appearance-none rounded-lg border border-gray-300 bg-transparent px-3 py-1.5 pr-8 text-xs shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 cursor-pointer"
                            style={{
                              backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                              backgroundPosition: 'right 0.5rem center',
                              backgroundSize: '1.25rem',
                              backgroundRepeat: 'no-repeat'
                            }}
                          >
                            {["Scheduled", "Completed", "Cancelled", "Rescheduled"].map((status) => (
                              <option
                                key={status}
                                value={status}
                                className="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-normal"
                              >
                                {status}
                              </option>
                            ))}
                          </select>
                        )}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/meetings/${meeting.id}`)}
                            className="p-1.5 text-gray-500 hover:text-brand-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition cursor-pointer"
                            title="View"
                          >
                            <FiEye className="size-4" />
                          </button>
                          {activeTab !== "completed" && (
                            <>
                              <button
                                onClick={() => navigate(`/meetings/${meeting.id}/edit`)}
                                className="p-1.5 text-gray-500 hover:text-brand-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition cursor-pointer"
                                title="Edit"
                              >
                                <FiEdit className="size-4" />
                              </button>
                              <button
                                onClick={() => handleOpenDelete(meeting)}
                                className="p-1.5 text-gray-500 hover:text-error-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition cursor-pointer"
                                title="Delete"
                              >
                                <FiTrash2 className="size-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="px-5 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      No meetings found matching search criteria.
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
              itemName="meetings"
            />
          )}
        </div>
      ) : viewMode === "calendar" ? (
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-white/[0.05]">
            <h3 className="text-base font-semibold text-gray-800 dark:text-white">
              {monthNames[currentMonth]} {currentYear}
            </h3>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={handlePrevMonth} className="h-9 px-3 py-1 font-medium text-xs">
                &lt; Prev
              </Button>
              <Button size="sm" variant="outline" onClick={handleNextMonth} className="h-9 px-3 py-1 font-medium text-xs">
                Next &gt;
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden">
            {/* Days of Week Headers */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="bg-gray-50 dark:bg-gray-900 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
                {day}
              </div>
            ))}

            {/* Grid Cells */}
            {calendarCells.map((cell, idx) => {
              const cellMeetings = getCellMeetings(cell);
              return (
                <div
                  key={idx}
                  className={`min-h-[120px] bg-white dark:bg-gray-950 p-2 flex flex-col justify-between transition-colors ${
                    cell.isCurrentMonth ? "" : "bg-gray-50/50 dark:bg-gray-900/40 text-gray-400"
                  }`}
                >
                  <div className="text-right">
                    <span className={`text-xs font-semibold ${cell.isCurrentMonth ? "text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-600"}`}>
                      {cell.day}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1.5 flex-1 overflow-y-auto max-h-[80px] custom-scrollbar">
                    {cellMeetings.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => navigate(`/meetings/${m.id}`)}
                        className={`w-full text-left truncate text-[10px] font-medium px-1.5 py-0.5 rounded transition hover:opacity-90 cursor-pointer block ${getMeetingStatusColor(m.status)}`}
                        title={`${m.time} - ${m.company}: ${m.subject}`}
                      >
                        {m.time} {m.company}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Kanban View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {["Scheduled", "Rescheduled", "Completed", "Cancelled"].map((status) => {
            const columnItems = processedMeetings.filter((m) => m.status === status);
            const colTotalPages = Math.ceil(columnItems.length / 3) || 1;
            const colPage = kanbanPages[status] || 1;
            const startIndex = (colPage - 1) * 3;
            const colPaginatedItems = columnItems.slice(startIndex, startIndex + 3);

            let headerBg = "bg-brand-50 border-brand-200 text-brand-700 dark:bg-brand-500/5 dark:border-brand-500/20 dark:text-brand-400";
            if (status === "Completed") {
              headerBg = "bg-success-50 border-success-200 text-success-700 dark:bg-success-500/5 dark:border-success-500/20 dark:text-success-400";
            } else if (status === "Cancelled") {
              headerBg = "bg-error-50 border-error-200 text-error-700 dark:bg-error-500/5 dark:border-error-500/20 dark:text-error-400";
            } else if (status === "Rescheduled") {
              headerBg = "bg-warning-50 border-warning-200 text-warning-700 dark:bg-warning-500/5 dark:border-warning-500/20 dark:text-warning-400";
            }

            return (
              <div
                key={status}
                className="flex flex-col rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-4 min-h-[400px] justify-between"
              >
                <div>
                  {/* Column Header */}
                  <div className={`flex items-center justify-between p-2.5 rounded-lg border mb-4 font-semibold text-xs ${headerBg}`}>
                    <span>{status}</span>
                    <span className="rounded-full px-2 py-0.5 bg-white/80 dark:bg-black/20 text-xs font-semibold">
                      {columnItems.length}
                    </span>
                  </div>

                  {/* Cards List */}
                  <div className="space-y-3">
                    {colPaginatedItems.length > 0 ? (
                      colPaginatedItems.map((meeting) => (
                        <div
                          key={meeting.id}
                          className="rounded-lg border border-gray-150 bg-gray-50/50 p-3.5 hover:shadow-xs transition dark:border-white/[0.05] dark:bg-white/[0.02]"
                        >
                          <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90 truncate mb-2" title={meeting.subject}>
                            {meeting.subject}
                          </h4>
                          <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                            <p className="flex items-center gap-1.5 truncate">
                              <FiBriefcase className="size-3.5 shrink-0" />
                              <span>{meeting.company}</span>
                            </p>
                            <p className="flex items-center gap-1.5 truncate">
                              <FiUser className="size-3.5 shrink-0" />
                              <span>{meeting.contactPerson}</span>
                            </p>
                            <p className="flex items-center gap-1.5">
                              <FiCalendar className="size-3.5 shrink-0" />
                              <span>{formatDate(meeting.date)}</span>
                            </p>
                            <p className="flex items-center gap-1.5">
                              <FiClock className="size-3.5 shrink-0" />
                              <span>{meeting.time}</span>
                            </p>
                          </div>

                          {/* Action Panel inside Card */}
                          <div className="mt-3 flex items-center justify-between gap-2 border-t border-gray-150 pt-2.5 dark:border-white/[0.05]">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => navigate(`/meetings/${meeting.id}`)}
                                className="p-1 text-gray-500 hover:text-brand-500 rounded cursor-pointer"
                                title="View Details"
                              >
                                <FiEye className="size-4" />
                              </button>
                              {activeTab !== "completed" && (
                                <>
                                  <button
                                    onClick={() => navigate(`/meetings/${meeting.id}/edit`)}
                                    className="p-1 text-gray-500 hover:text-brand-500 rounded cursor-pointer"
                                    title="Edit"
                                  >
                                    <FiEdit className="size-4" />
                                  </button>
                                  <button
                                    onClick={() => handleOpenDelete(meeting)}
                                    className="p-1 text-gray-500 hover:text-error-500 rounded cursor-pointer"
                                    title="Delete"
                                  >
                                    <FiTrash2 className="size-4" />
                                  </button>
                                </>
                              )}
                            </div>

                            {activeTab === "completed" ? (
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${getMeetingStatusColor(meeting.status)}`}>
                                {meeting.status}
                              </span>
                            ) : (
                              <select
                                value={meeting.status}
                                onChange={(e) => handleStatusChange(meeting.id, e.target.value as Meeting["status"])}
                                className="h-7 rounded border border-gray-300 bg-white px-1.5 text-[10px] text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 cursor-pointer"
                              >
                                <option value="Scheduled">Scheduled</option>
                                <option value="Rescheduled">Rescheduled</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-gray-200 rounded-lg dark:border-white/[0.05]">
                        <p className="text-xs text-gray-400">No meetings</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Column Pagination Controls */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-150 dark:border-white/[0.05]">
                  <button
                    disabled={colPage === 1}
                    onClick={() => setKanbanPages((prev) => ({ ...prev, [status]: Math.max(1, colPage - 1) }))}
                    className="px-2 py-1 rounded text-xs font-semibold text-gray-500 hover:bg-gray-150 disabled:opacity-40 disabled:cursor-not-allowed dark:hover:bg-white/5 cursor-pointer"
                  >
                    &larr; Prev
                  </button>
                  <span className="text-[10px] font-medium text-gray-400">
                    {colPage} of {colTotalPages}
                  </span>
                  <button
                    disabled={colPage === colTotalPages}
                    onClick={() => setKanbanPages((prev) => ({ ...prev, [status]: Math.min(colTotalPages, colPage + 1) }))}
                    className="px-2 py-1 rounded text-xs font-semibold text-gray-500 hover:bg-gray-150 disabled:opacity-40 disabled:cursor-not-allowed dark:hover:bg-white/5 cursor-pointer"
                  >
                    Next &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Outcome Selection Modal (Won/Lost) */}
      <Modal isOpen={showOutcomeModal} onClose={() => { setShowOutcomeModal(false); setOutcomeType(null); }} className="max-w-[480px] m-4">
        <div className="relative w-full rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
          <div className="mb-6 space-y-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-1">
                Complete Meeting Outcome
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Select the outcome for <span className="font-semibold text-gray-700 dark:text-gray-300">{pendingOutcomeMeeting?.company}</span> meeting.
              </p>
            </div>

            {/* Won/Lost Toggle Cards */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOutcomeType("Won")}
                className={`rounded-xl border-2 p-4 text-center transition-all duration-200 cursor-pointer ${
                  outcomeType === "Won"
                    ? "border-success-500 bg-success-50 dark:bg-success-500/10 shadow-xs"
                    : "border-gray-200 hover:border-gray-300 dark:border-white/[0.05] dark:hover:border-white/20"
                }`}
              >
                <span className="text-2xl block mb-1">🏆</span>
                <span className={`text-sm font-semibold ${outcomeType === "Won" ? "text-success-700 dark:text-success-400" : "text-gray-700 dark:text-gray-300"}`}>
                  Won
                </span>
                <span className="text-xs text-gray-400 block mt-0.5">Deal closed</span>
              </button>
              <button
                type="button"
                onClick={() => setOutcomeType("Lost")}
                className={`rounded-xl border-2 p-4 text-center transition-all duration-200 cursor-pointer ${
                  outcomeType === "Lost"
                    ? "border-error-500 bg-error-50 dark:bg-error-500/10 shadow-xs"
                    : "border-gray-200 hover:border-gray-300 dark:border-white/[0.05] dark:hover:border-white/20"
                }`}
              >
                <span className="text-2xl block mb-1">📉</span>
                <span className={`text-sm font-semibold ${outcomeType === "Lost" ? "text-error-700 dark:text-error-400" : "text-gray-700 dark:text-gray-300"}`}>
                  Lost
                </span>
                <span className="text-xs text-gray-400 block mt-0.5">Deal dead</span>
              </button>
            </div>

            {/* Lost Reason (shown when Lost) */}
            {outcomeType === "Lost" && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                  Lost Reason <span className="text-error-500">*</span>
                </label>
                <Select
                  options={getStorage<any[]>("saiflow_master_lost_reasons", LOST_REASONS)
                    .filter((r: any) => r.status === "Active")
                    .map((r: any) => ({ value: r.name, label: r.name }))}
                  placeholder="Select lost reason"
                  onChange={(val: string) => setOutcomeLostReason(val)}
                />
              </div>
            )}

            {/* Summary */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                Outcome Summary / Notes
              </label>
              <textarea
                value={outcomeSummary}
                onChange={(e) => setOutcomeSummary(e.target.value)}
                placeholder="E.g., Client agreed to proceed with proposal..."
                rows={3}
                className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
              />
            </div>

            {/* Next Action */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                Next Action
              </label>
              <Select
                options={
                  outcomeType === "Won"
                    ? [
                        { value: "Create Follow-up", label: "Create Follow-up" },
                        { value: "Create Quotation", label: "Create Quotation" },
                        { value: "Convert Lead", label: "Convert Lead" },
                        { value: "Schedule Next Meeting", label: "Schedule Next Meeting" },
                      ]
                    : [
                        { value: "Create Follow-up", label: "Create Follow-up" },
                        { value: "Create Quotation", label: "Create Quotation" },
                        { value: "Schedule Next Meeting", label: "Schedule Next Meeting" },
                      ]
                }
                placeholder="Select next action"
                defaultValue={outcomeNextAction}
                onChange={(val: string) => setOutcomeNextAction(val)}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => { setShowOutcomeModal(false); setOutcomeType(null); }}
              className="w-1/2"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmOutcome}
              className={`w-1/2 text-white ${
                outcomeType === "Won"
                  ? "bg-success-600 hover:bg-success-700"
                  : "bg-error-600 hover:bg-error-700"
              }`}
              disabled={!outcomeType || (outcomeType === "Lost" && !outcomeLostReason)}
            >
              Confirm {outcomeType || "Outcome"}
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
              Delete meeting
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this meeting: <span className="font-semibold text-gray-700 dark:text-gray-300">{selectedMeeting?.subject}</span>? This action cannot be undone.
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
