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
import { FiEye, FiEdit, FiTrash2, FiPlus } from "react-icons/fi";
import { useToast } from "../../../hooks/useToast";
import { Meeting } from "../data/meetingsData";

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

  const [viewMode, setViewMode] = useState<"table" | "calendar">("table");
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
    if (onUpdateMeetingStatus) {
      onUpdateMeetingStatus(meetingId, newStatus);
      showToast(`Meeting status updated to "${newStatus}" successfully.`, "success");
    }
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
        title="Meetings | ClienZo"
        description="View and manage meetings in ClienZo CRM."
      />
      <PageBreadcrumb pageTitle="Meetings" />


      {/* Modern Premium Tabs Control Header */}
      <div className="flex border-b border-gray-200 dark:border-white/[0.05] mb-6">
        <button
          onClick={() => handleTabChange("upcoming")}
          className={`pb-3 text-sm font-medium px-4 border-b-2 transition-all duration-200 cursor-pointer ${activeTab === "upcoming"
              ? "border-brand-500 text-brand-500 font-semibold"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
        >
          Upcoming Meetings
        </button>
        <button
          onClick={() => handleTabChange("today")}
          className={`pb-3 text-sm font-medium px-4 border-b-2 transition-all duration-200 cursor-pointer ${activeTab === "today"
              ? "border-brand-500 text-brand-500 font-semibold"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
        >
          Today's Meetings
        </button>
        <button
          onClick={() => handleTabChange("completed")}
          className={`pb-3 text-sm font-medium px-4 border-b-2 transition-all duration-200 cursor-pointer ${activeTab === "completed"
              ? "border-brand-500 text-brand-500 font-semibold"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
        >
          Completed Meetings
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
          <Button
            size="sm"
            variant="outline"
            onClick={() => setViewMode(viewMode === "table" ? "calendar" : "table")}
            className="w-full sm:w-auto h-11 px-4 py-2.5"
          >
            {viewMode === "table" ? "Calendar view" : "Table view"}
          </Button>
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
      ) : (
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
      )}

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
