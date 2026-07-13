import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Badge from "../../../components/ui/badge/Badge";
import Button from "../../../components/ui/button/Button";
import { initialMeetings, getMeetingStatusColor, Meeting } from "../data/meetingsData";
import { getStorage, setStorage } from "../../../utils/storage";
import { Lead, initialLeads } from "../../LeadManagement/data/leadsData";
import { LOST_REASONS } from "../../Master/data/masterData";
import { useToast } from "../../../hooks/useToast";
import { Modal } from "../../../components/ui/modal";
import Select from "../../../components/form/Select";
import {
  FiBriefcase,
  FiUser,
  FiCalendar,
  FiClock,
  FiVideo,
  FiMapPin,
  FiFileText,
  FiArrowLeft,
  FiEdit,
} from "react-icons/fi";

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

function InfoCard({ icon, label, value }: InfoCardProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3.5 dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-gray-800">
        <span className="text-gray-500 dark:text-gray-400">{icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <span className="block text-xs text-gray-400 dark:text-gray-500 mb-0.5">
          {label}
        </span>
        <span className="block text-sm font-medium text-gray-800 dark:text-white/90 break-words">
          {value || <span className="text-gray-400 font-normal">—</span>}
        </span>
      </div>
    </div>
  );
}

export default function MeetingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [matchingLead, setMatchingLead] = useState<Lead | null>(null);
  const [showLostModal, setShowLostModal] = useState(false);
  const [selectedLostReason, setSelectedLostReason] = useState("");

  const loadData = () => {
    const meetings = getStorage<Meeting[]>("saiflow_meetings", initialMeetings);
    const foundMeeting = meetings.find((m) => m.id === Number(id));
    if (foundMeeting) {
      setMeeting(foundMeeting);
      const leads = getStorage<Lead[]>("saiflow_leads", initialLeads);
      const lead = leads.find((l) => l.company.toLowerCase() === foundMeeting.company.toLowerCase());
      setMatchingLead(lead || null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleMarkWon = () => {
    if (!meeting) return;
    const meetings = getStorage<Meeting[]>("saiflow_meetings", initialMeetings);
    const updatedMeetings = meetings.map((m) =>
      m.id === meeting.id ? { ...m, status: "Completed" as const } : m
    );
    setStorage("saiflow_meetings", updatedMeetings);

    if (matchingLead) {
      const leadsList = getStorage<Lead[]>("saiflow_leads", initialLeads);
      const updatedLeads = leadsList.map((l) =>
        l.id === matchingLead.id ? { ...l, status: "Won" as const } : l
      );
      setStorage("saiflow_leads", updatedLeads);
    }

    showToast("Meeting marked as Completed and Lead marked as Won!", "success");
    loadData();
  };

  const handleMarkLost = (reason: string) => {
    if (!meeting) return;
    const meetings = getStorage<Meeting[]>("saiflow_meetings", initialMeetings);
    const updatedMeetings = meetings.map((m) =>
      m.id === meeting.id ? { ...m, status: "Completed" as const } : m
    );
    setStorage("saiflow_meetings", updatedMeetings);

    if (matchingLead) {
      const leadsList = getStorage<Lead[]>("saiflow_leads", initialLeads);
      const updatedLeads = leadsList.map((l) =>
        l.id === matchingLead.id
          ? {
              ...l,
              status: "Lost" as const,
              notes: `${l.notes || ""}\nMeeting concluded. Lost reason: ${reason}`,
            }
          : l
      );
      setStorage("saiflow_leads", updatedLeads);
    }

    showToast("Meeting marked as Completed and Lead marked as Lost.", "error");
    setShowLostModal(false);
    loadData();
  };

  const handleCancelMeeting = () => {
    if (!meeting) return;
    const meetings = getStorage<Meeting[]>("saiflow_meetings", initialMeetings);
    const updatedMeetings = meetings.map((m) =>
      m.id === meeting.id ? { ...m, status: "Cancelled" as const } : m
    );
    setStorage("saiflow_meetings", updatedMeetings);
    showToast("Meeting cancelled successfully.", "success");
    loadData();
  };

  const lostReasons = getStorage<any[]>("saiflow_master_lost_reasons", LOST_REASONS)
    .filter((r) => r.status === "Active");

  if (!meeting) {
    return (
      <>
        <PageBreadcrumb pageTitle="Meeting details" />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
            Meeting not found
          </p>
          <p className="text-sm text-gray-400 mb-6">
            The meeting you're looking for does not exist or has been deleted.
          </p>
          <Button size="sm" onClick={() => navigate("/meetings")}>
            Back to meeting list
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <PageMeta
        title="Meeting Details | SaiFlow"
        description="View details and manage scheduled meeting outcome."
      />
      <PageBreadcrumb pageTitle="Meeting details" />

      {/* Top action bar */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => navigate("/meetings")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-white transition cursor-pointer"
        >
          <FiArrowLeft className="size-4" />
          Back to list
        </button>
        <Button
          size="sm"
          onClick={() => navigate(`/meetings/${meeting.id}/edit`)}
          startIcon={<FiEdit className="size-4" />}
        >
          Edit meeting
        </Button>
      </div>

      {/* Header Card */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-gray-200 bg-white px-6 py-5 mb-5 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            {meeting.subject}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Conducted via {meeting.type}
          </p>
        </div>
        <div>
          <Badge size="md" color={getMeetingStatusColor(meeting.status)}>
            {meeting.status}
          </Badge>
        </div>
      </div>

      {/* Log Outcome Panel */}
      {meeting.status !== "Completed" && meeting.status !== "Cancelled" && (
        <div className="rounded-xl border border-warning-200 bg-warning-50/50 p-5 mb-5 dark:border-warning-500/20 dark:bg-warning-500/5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
                Log Meeting Outcome
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Conclude the meeting and update lead status for{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {meeting.company}
                </span>{" "}
                (Current Lead Status:{" "}
                <span className="font-semibold text-brand-500">
                  {matchingLead ? matchingLead.status : "N/A"}
                </span>
                )
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                onClick={handleMarkWon}
                className="bg-success-600 hover:bg-success-700 text-white border-transparent"
              >
                Mark Won
              </Button>
              <Button
                size="sm"
                onClick={() => setShowLostModal(true)}
                className="bg-error-600 hover:bg-error-700 text-white border-transparent"
              >
                Mark Lost
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancelMeeting}
              >
                Cancel Meeting
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Information Cards Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Core Schedule Details */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05]">
            Schedule details
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoCard
              icon={<FiCalendar className="size-4" />}
              label="Meeting Date"
              value={formatDate(meeting.date)}
            />
            <InfoCard
              icon={<FiClock className="size-4" />}
              label="Meeting Time"
              value={meeting.time}
            />
            <InfoCard
              icon={<FiBriefcase className="size-4" />}
              label="Company / Lead"
              value={meeting.company}
            />
            <InfoCard
              icon={<FiUser className="size-4" />}
              label="Contact Person"
              value={meeting.contactPerson}
            />
          </div>
        </div>

        {/* Location & Link Info */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05]">
            Location / Link Info
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoCard
              icon={meeting.type === "Google Meet" ? <FiVideo className="size-4 text-brand-500" /> : <FiMapPin className="size-4" />}
              label="Meeting Type"
              value={meeting.type}
            />
            <div className="sm:col-span-2">
              <InfoCard
                icon={meeting.type === "Google Meet" ? <FiVideo className="size-4 text-brand-500" /> : <FiMapPin className="size-4" />}
                label={meeting.type === "Google Meet" ? "Google Meet Link" : "Venue / Location"}
                value={
                  meeting.type === "Google Meet" ? (
                    <a
                      href={meeting.linkOrLocation}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-500 hover:underline break-all"
                    >
                      {meeting.linkOrLocation}
                    </a>
                  ) : (
                    meeting.linkOrLocation
                  )
                }
              />
            </div>
          </div>
        </div>

        {/* Notes & Agenda */}
        <div className="sm:col-span-2 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05]">
            Agenda & Notes
          </h3>
          <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3.5 dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-gray-800">
              <FiFileText className="size-4 text-gray-500 dark:text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
              {meeting.notes || <span className="text-gray-400">No agenda notes provided.</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Lost Reason Modal */}
      <Modal
        isOpen={showLostModal}
        onClose={() => setShowLostModal(false)}
        className="max-w-[450px] m-4"
      >
        <div className="relative w-full rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">
              Mark Lead as Lost
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Please specify the reason why this lead was lost.
            </p>
            <Select
              options={lostReasons.map((r) => ({ value: r.name, label: r.name }))}
              placeholder="Select lost reason"
              onChange={(val: string) => setSelectedLostReason(val)}
              defaultValue={selectedLostReason}
            />
          </div>
          <div className="flex items-center justify-end gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowLostModal(false)}
              className="w-1/2"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => handleMarkLost(selectedLostReason || "No reason specified")}
              className="w-1/2 bg-error-600 hover:bg-error-700 text-white"
              disabled={!selectedLostReason}
            >
              Confirm Lost
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
