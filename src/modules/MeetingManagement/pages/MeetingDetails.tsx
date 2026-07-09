import { useParams, useNavigate } from "react-router";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Badge from "../../../components/ui/badge/Badge";
import Button from "../../../components/ui/button/Button";
import { initialMeetings, getMeetingStatusColor } from "../data/meetingsData";
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

  const meeting = initialMeetings.find((m) => m.id === Number(id));

  if (!meeting) {
    return (
      <>
        <PageBreadcrumb pageTitle="Meeting details" />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
            Meeting not found
          </p>
          <Button size="sm" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <PageMeta
        title="Meeting Details | ClienZo"
        description="View detailed information about a meeting in ClienZo CRM."
      />
      <PageBreadcrumb pageTitle="Meeting details" />

      {/* Action bar */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-white transition cursor-pointer"
        >
          <FiArrowLeft className="size-4" />
          Back
        </button>
        <Button
          size="sm"
          onClick={() => navigate(`/meetings/${meeting.id}/edit`)}
          startIcon={<FiEdit className="size-4" />}
        >
          Edit meeting
        </Button>
      </div>

      {/* Header Summary Card */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-gray-200 bg-white px-6 py-5 mb-5 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            {meeting.subject}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Meeting with {meeting.company} ({meeting.contactPerson})
          </p>
        </div>
        <div>
          <Badge size="md" color={getMeetingStatusColor(meeting.status)}>
            {meeting.status}
          </Badge>
        </div>
      </div>

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
    </>
  );
}
