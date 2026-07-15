import { useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Badge from "../../../components/ui/badge/Badge";
import { initialLeads, getStatusColor, getPriorityColor, Lead } from "../../LeadManagement/data/leadsData";
import { getStorage } from "../../../utils/storage";
import {
  FiBriefcase,
  FiUser,
  FiMail,
  FiPhone,
  FiGlobe,
  FiMapPin,
  FiTag,
  FiUserCheck,
  FiFileText,
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiCalendar,
  FiMessageSquare,
  FiActivity,
} from "react-icons/fi";

// ──────────────────────────────────────────────
// Activity types & helpers
// ──────────────────────────────────────────────

interface Activity {
  id: string;
  type: "contact_outcome" | "follow_up" | "meeting" | "status_change" | "lead_created";
  title: string;
  description: string;
  timestamp: string;
  icon: React.ReactNode;
  color: string;
}

function getActivitiesForLead(leadId: number, lead: Lead): Activity[] {
  const result: Activity[] = [];

  // 1. Lead created
  if (lead.createdAt) {
    result.push({
      id: `created-${lead.id}`,
      type: "lead_created",
      title: "Lead created",
      description: `Lead was created and assigned to ${lead.assignedTo}.`,
      timestamp: lead.createdAt,
      icon: <FiActivity className="size-4" />,
      color: "bg-brand-500",
    });
  }

  // 2. Parse notes for [Contact] entries
  if (lead.notes) {
    const lines = lead.notes.split("\n");
    let noteIdx = 0;
    for (const line of lines) {
      const contactMatch = line.match(/^\[Contact\]\s+(Interested|Call Later|Not Interested)(?::\s*(.*))?$/);
      if (contactMatch) {
        const outcome = contactMatch[1];
        const summary = contactMatch[2] || "No summary provided.";
        result.push({
          id: `contact-${lead.id}-${noteIdx}`,
          type: "contact_outcome",
          title: outcome === "Interested" ? "Contacted — Interested" : outcome === "Call Later" ? "Contacted — Call Later" : "Contacted — Not Interested",
          description: summary,
          timestamp: "",
          icon:
            outcome === "Interested" ? (
              <FiCheckCircle className="size-4" />
            ) : outcome === "Call Later" ? (
              <FiClock className="size-4" />
            ) : (
              <FiXCircle className="size-4" />
            ),
          color:
            outcome === "Interested"
              ? "bg-success-500"
              : outcome === "Call Later"
              ? "bg-warning-500"
              : "bg-error-500",
        });
      }
      noteIdx++;
    }
  }

  // 3. Follow-ups from saiflow_followups
  const followups = getStorage<any[]>("saiflow_followups", []);
  for (const f of followups.filter((f: any) => f.leadId === leadId)) {
    const statusColor =
      f.status === "Completed" ? "bg-success-500" : f.status === "Missed" ? "bg-error-500" : "bg-warning-500";
    result.push({
      id: `followup-${f.id}`,
      type: "follow_up",
      title: `Follow-up ${f.status}`,
      description: `${f.reason || "No reason provided"} — ${f.date} at ${f.time}`,
      timestamp: `${f.date}T${f.time}`,
      icon: <FiMessageSquare className="size-4" />,
      color: statusColor,
    });
  }

  // 4. Meetings from saiflow_meetings
  const meetings = getStorage<any[]>("saiflow_meetings", []);
  for (const m of meetings.filter((m: any) => m.leadId === leadId)) {
    const statusColor =
      m.status === "Completed" ? "bg-success-500" : m.status === "Cancelled" ? "bg-error-500" : "bg-warning-500";
    result.push({
      id: `meeting-${m.id}`,
      type: "meeting",
      title: `${m.subject || "Meeting"} — ${m.status}`,
      description: `${m.type || "Meeting"} on ${m.date} at ${m.time}${m.notes ? ` — ${m.notes}` : ""}`,
      timestamp: `${m.date}T${m.time}`,
      icon: <FiCalendar className="size-4" />,
      color: statusColor,
    });
  }

  // Sort newest first — push items with no timestamp to the end
  result.sort((a, b) => {
    if (!a.timestamp && !b.timestamp) return 0;
    if (!a.timestamp) return 1;
    if (!b.timestamp) return -1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  return result;
}

// ──────────────────────────────────────────────
// Inline card component
// ──────────────────────────────────────────────

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3.5 dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-gray-800">
        <span className="text-gray-500 dark:text-gray-400">{icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <span className="block text-xs text-gray-400 dark:text-gray-500 mb-0.5">{label}</span>
        <span className="block text-sm font-medium text-gray-800 dark:text-white/90 break-words">
          {value || <span className="text-gray-400 font-normal">—</span>}
        </span>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Activity item component
// ──────────────────────────────────────────────

function ActivityItem({ activity, isLast }: { activity: Activity; isLast?: boolean }) {
  const formattedDate = activity.timestamp
    ? new Date(activity.timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="relative flex gap-4 pb-6 last:pb-0">
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white ${activity.color}`}
        >
          {activity.icon}
        </div>
        <div
          className="mt-1 w-px flex-1 bg-gray-200 dark:bg-gray-700"
          style={isLast ? { display: "none" } : undefined}
        />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 pt-1">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-gray-800 dark:text-white/90">
            {activity.title}
          </h4>
          {formattedDate && (
            <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
              {formattedDate}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {activity.description}
        </p>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────

export default function ContactLeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const leads = getStorage<Lead[]>("saiflow_leads", initialLeads);
  const lead = leads.find((l) => l.id === Number(id));

  const activities = useMemo(() => {
    if (!lead) return [];
    // Only show My Lead related activities: contact outcomes & follow-ups
    return getActivitiesForLead(lead.id, lead).filter(
      (a) => a.type === "contact_outcome" || a.type === "follow_up"
    );
  }, [lead]);

  if (!lead) {
    return (
      <>
        <PageBreadcrumb pageTitle="Lead details" />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
            Lead not found
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/contacts/my-leads")}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-white transition cursor-pointer"
            >
              <FiArrowLeft className="size-4" />
              Back to my leads
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageMeta
        title="Lead Details | SaiFlow"
        description="View lead details and activity log in SaiFlow CRM."
      />
      <PageBreadcrumb pageTitle="Lead details" />

      {/* Top action bar */}
      <div className="mb-5">
        <button
          onClick={() => navigate("/contacts/my-leads")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-white transition cursor-pointer"
        >
          <FiArrowLeft className="size-4" />
          Back to my leads
        </button>
      </div>

      {/* Header Card */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-gray-200 bg-white px-6 py-5 mb-5 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            {lead.leadTitle || `${lead.company} Expansion`}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1.5">
            <span className="font-medium text-gray-700 dark:text-gray-300">{lead.company}</span>
            <span className="text-gray-300 dark:text-gray-750">•</span>
            <span>{lead.contactPerson}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center rounded-lg bg-gray-100 dark:bg-white/[0.05] px-3 py-1.5 text-xs font-mono tracking-wider text-gray-600 dark:text-gray-400">
            SF-LEAD-{String(lead.id).padStart(4, "0")}
          </span>
          <Badge size="md" color={getStatusColor(lead.status)}>
            {lead.status}
          </Badge>
          <Badge size="md" color={getPriorityColor(lead.priority)}>
            {lead.priority || "Medium"} Priority
          </Badge>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Card 1: Lead Information */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05]">
            Lead information
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoCard
              icon={<FiTag className="size-4" />}
              label="Lead ID"
              value={`SF-LEAD-${String(lead.id).padStart(4, "0")}`}
            />
            <InfoCard
              icon={<FiFileText className="size-4" />}
              label="Lead Title"
              value={lead.leadTitle || `${lead.company} Expansion`}
            />
            <InfoCard
              icon={<FiBriefcase className="size-4" />}
              label="Company Name"
              value={lead.company}
            />
            <InfoCard
              icon={<FiUser className="size-4" />}
              label="Contact Person"
              value={lead.contactPerson}
            />
            <InfoCard
              icon={<FiUser className="size-4" />}
              label="Designation"
              value={lead.designation}
            />
          </div>
        </div>

        {/* Card 2: Contact Details */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05]">
            Contact details
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoCard
              icon={<FiPhone className="size-4" />}
              label="Mobile Number"
              value={lead.phone}
            />
            <InfoCard
              icon={<FiPhone className="size-4" />}
              label="Alternate Mobile"
              value={lead.alternatePhone}
            />
            <InfoCard
              icon={<FiMail className="size-4" />}
              label="Email Address"
              value={
                lead.email ? (
                  <a href={`mailto:${lead.email}`} className="text-brand-500 hover:underline">
                    {lead.email}
                  </a>
                ) : ""
              }
            />
            <InfoCard
              icon={<FiMail className="size-4" />}
              label="Alternate Email"
              value={
                lead.alternateEmail ? (
                  <a href={`mailto:${lead.alternateEmail}`} className="text-brand-500 hover:underline">
                    {lead.alternateEmail}
                  </a>
                ) : ""
              }
            />
            <InfoCard
              icon={<FiGlobe className="size-4" />}
              label="Website"
              value={
                lead.website ? (
                  <a
                    href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-500 hover:underline"
                  >
                    {lead.website}
                  </a>
                ) : ""
              }
            />
          </div>
        </div>

        {/* Card 3: Company Details */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05]">
            Company details
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoCard
              icon={<FiBriefcase className="size-4" />}
              label="Industry"
              value={lead.industry}
            />
            <InfoCard
              icon={<FiFileText className="size-4" />}
              label="GST Number"
              value={lead.gstNumber}
            />
          </div>
        </div>

        {/* Card 4: Address */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05]">
            Address
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <InfoCard
                icon={<FiMapPin className="size-4" />}
                label="Address Line 1"
                value={lead.addressLine1 || lead.address}
              />
            </div>
            <InfoCard
              icon={<FiMapPin className="size-4" />}
              label="Country"
              value={lead.country}
            />
            <InfoCard
              icon={<FiMapPin className="size-4" />}
              label="State"
              value={lead.state}
            />
            <InfoCard
              icon={<FiMapPin className="size-4" />}
              label="City"
              value={lead.city}
            />
            <InfoCard
              icon={<FiMapPin className="size-4" />}
              label="Pincode"
              value={lead.pincode}
            />
          </div>
        </div>

        {/* Card 5: Lead Details */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05]">
            Lead details
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoCard
              icon={<FiTag className="size-4" />}
              label="Lead Source"
              value={lead.source}
            />
            <InfoCard
              icon={<FiTag className="size-4" />}
              label="Lead Status"
              value={
                <Badge size="sm" color={getStatusColor(lead.status)}>
                  {lead.status}
                </Badge>
              }
            />
            <InfoCard
              icon={<FiTag className="size-4" />}
              label="Priority"
              value={
                <Badge size="sm" color={getPriorityColor(lead.priority)}>
                  {lead.priority || "Medium"}
                </Badge>
              }
            />
          </div>
        </div>

        {/* Card 6: Assignment */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05]">
            Assignment
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoCard
              icon={<FiUserCheck className="size-4" />}
              label="Lead Owner"
              value={lead.assignedTo}
            />
            <InfoCard
              icon={<FiCalendar className="size-4" />}
              label="Assigned Date"
              value={
                lead.assignedDate
                  ? new Date(lead.assignedDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : ""
              }
            />
          </div>
        </div>

      </div>

      {/* Activity Log */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-5 pb-2 border-b border-gray-100 dark:border-white/[0.05] flex items-center gap-2">
          <FiActivity className="size-4" />
          Activity log
        </h3>

        {activities.length > 0 ? (
          <div className="pl-1">
            {activities.map((activity, idx) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                isLast={idx === activities.length - 1}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <FiActivity className="size-8 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No activities recorded yet.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Activities will appear here when you contact this lead from the My Leads page.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
