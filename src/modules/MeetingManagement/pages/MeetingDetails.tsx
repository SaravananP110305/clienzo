import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Badge from "../../../components/ui/badge/Badge";
import Button from "../../../components/ui/button/Button";
import { initialMeetings, getMeetingStatusColor, Meeting } from "../data/meetingsData";
import { getStorage, setStorage } from "../../../utils/storage";
import { Lead, initialLeads } from "../../LeadManagement/data/leadsData";
import { Client, initialClients } from "../../ClientManagement/data/clientsData";
import { useToast } from "../../../hooks/useToast";
import { Modal } from "../../../components/ui/modal";
import Select from "../../../components/form/Select";
import Input from "../../../components/form/input/InputField";
import {
  FiBriefcase,
  FiUser,
  FiCalendar,
  FiClock,
  FiVideo,
  FiMapPin,
  FiArrowLeft,
  FiEdit,
  FiActivity,
  FiExternalLink,
  FiLink,
} from "react-icons/fi";

interface MeetingActivityLog {
  id: string;
  meetingId: number;
  action: string;
  description: string;
  timestamp: string;
  operator: string;
}

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
  
  // Modals state
  const [showConvertModal, setShowConvertModal] = useState(false);

  // Conversion Form Entries
  const [paymentTerms, setPaymentTerms] = useState("Net 30");
  const [creditLimit, setCreditLimit] = useState("500000");
  const [relManager, setRelManager] = useState("John Doe");
  const [accManager, setAccManager] = useState("Jane Smith");

  const [activityLogs, setActivityLogs] = useState<MeetingActivityLog[]>([]);

  const loggedInUser = getStorage<any>("saiflow_logged_in_user", {
    name: "Admin User",
    email: "admin@gmail.com",
    role: "Administrator",
  });

  const logActivity = (action: string, description: string) => {
    if (!meeting) return;
    const logs = getStorage<MeetingActivityLog[]>("saiflow_meeting_logs", []);
    const newLog: MeetingActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      meetingId: meeting.id,
      action,
      description,
      timestamp: new Date().toISOString(),
      operator: loggedInUser?.name || "Admin User",
    };
    const updatedLogs = [newLog, ...logs];
    setStorage("saiflow_meeting_logs", updatedLogs);
    setActivityLogs(updatedLogs.filter(l => l.meetingId === meeting.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  };

  const loadData = () => {
    const meetings = getStorage<Meeting[]>("saiflow_meetings", initialMeetings);
    const foundMeeting = meetings.find((m) => m.id === Number(id));
    if (foundMeeting) {
      setMeeting(foundMeeting);
      const leads = getStorage<Lead[]>("saiflow_leads", initialLeads);
      
      // Attempt to search matching lead by relatedToId or by company name
      let lead: Lead | undefined;
      if (foundMeeting.relatedToType === "Lead" && foundMeeting.relatedToId) {
        lead = leads.find((l) => l.id === foundMeeting.relatedToId);
      } else {
        lead = leads.find((l) => l.company.toLowerCase() === foundMeeting.company.toLowerCase());
      }
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

  const formatTime12hr = (timeStr: string) => {
    if (!timeStr) return "";
    if (timeStr.includes("AM") || timeStr.includes("PM")) return timeStr;
    const parts = timeStr.split(":");
    if (parts.length < 2) return timeStr;
    const hour = parseInt(parts[0], 10);
    const minStr = parts[1];
    if (isNaN(hour)) return timeStr;
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minStr} ${ampm}`;
  };

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    if (meeting) {
      const allLogs = getStorage<MeetingActivityLog[]>("saiflow_meeting_logs", []);
      let meetingLogs = allLogs.filter((l) => l.meetingId === meeting.id);
      
      if (meetingLogs.length === 0) {
        const initialLog: MeetingActivityLog = {
          id: `log-init-${meeting.id}`,
          meetingId: meeting.id,
          action: "Meeting Scheduled",
          description: `Meeting scheduled with ${meeting.contactPerson} from ${meeting.company}.`,
          timestamp: new Date(meeting.date + (meeting.time ? "T" + meeting.time : "")).toISOString(),
          operator: "System",
        };
        const updatedLogs = [initialLog, ...allLogs];
        setStorage("saiflow_meeting_logs", updatedLogs);
        meetingLogs = [initialLog];
      }
      
      meetingLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setActivityLogs(meetingLogs);
    }
  }, [meeting]);

  const handleConvertLeadConfirm = () => {
    if (!meeting || !matchingLead) return;

    const clientsList = getStorage<Client[]>("saiflow_clients", initialClients);
    
    // Check if client company already exists
    const exists = clientsList.some((c) => c.company.toLowerCase() === matchingLead.company.toLowerCase());
    if (exists) {
      showToast(`A client with company name "${matchingLead.company}" already exists.`, "error");
      setShowConvertModal(false);
      return;
    }

    const newClientId = clientsList.length > 0 ? Math.max(...clientsList.map((c) => c.id)) + 1 : 1;
    const newClient: Client = {
      id: newClientId,
      company: matchingLead.company,
      name: matchingLead.contactPerson,
      email: matchingLead.email,
      phone: matchingLead.phone,
      projectsCount: 0,
      status: "Active",
      industry: matchingLead.industry,
      gstNumber: matchingLead.gstNumber || "",
      panNumber: "",
      website: matchingLead.website || "",
      companyEmail: matchingLead.email,
      companyPhone: matchingLead.phone,
      address: matchingLead.addressLine1 || matchingLead.address || "",
      city: matchingLead.city || "",
      state: matchingLead.state || "",
      country: matchingLead.country || "India",
      pincode: matchingLead.pincode || "",
      contactName: matchingLead.contactPerson,
      designation: matchingLead.designation || "",
      mobile: matchingLead.phone,
      relationshipManager: relManager,
      accountManager: accManager,
      clientSince: new Date().toISOString().split("T")[0],
      paymentTerms: paymentTerms,
      preferredCommunication: "Email",
      creditLimit: creditLimit,
    };

    const updatedClients = [...clientsList, newClient];
    setStorage("saiflow_clients", updatedClients);

    // Update Meeting relation to type Client (lead is already Won)
    const meetings = getStorage<Meeting[]>("saiflow_meetings", initialMeetings);
    const updatedMeetings = meetings.map((m) =>
      m.id === meeting.id ? { ...m, relatedToType: "Client" as const, relatedToId: newClientId } : m
    );
    setStorage("saiflow_meetings", updatedMeetings);

    logActivity("Converted Lead", `Lead ${matchingLead.company} successfully converted to Client.`);
    showToast(`Lead converted to Client ${matchingLead.company} successfully!`, "success");
    setShowConvertModal(false);
    
    // Redirect directly to the Client Details View
    navigate(`/clients/${newClientId}`);
  };

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
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
            <span>Type: {meeting.meetingType || "Discussion"}</span>
            <span>•</span>
            <span>Platform: {meeting.meetingPlatform || meeting.type || "Online"}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {meeting.relatedToType && meeting.relatedToId && (
            <Badge size="md" color="info">
              Related: {meeting.relatedToType}
            </Badge>
          )}
          <Badge size="md" color={getMeetingStatusColor(meeting.status)}>
            {meeting.status}
          </Badge>
        </div>
      </div>

      {/* Convert Lead Alert Panel if Won but not yet converted */}
      {meeting.relatedToType === "Lead" && matchingLead && matchingLead.status === "Won" && (
        <div className="rounded-xl border border-success-200 bg-success-50/50 p-5 mb-5 dark:border-success-500/20 dark:bg-success-500/5 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-success-850 dark:text-success-400">
              Lead is Won! Ready to convert?
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              This lead has been successfully won. Convert it to Client Management to start projects.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setShowConvertModal(true)}
            className="bg-success-600 hover:bg-success-700 text-white"
          >
            Convert to Client
          </Button>
        </div>
      )}

      {/* Information Cards Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Core Schedule Details */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05]">
            Schedule Details
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoCard
              icon={<FiCalendar className="size-4" />}
              label="Meeting Date"
              value={formatDate(meeting.date)}
            />
            <InfoCard
              icon={<FiClock className="size-4" />}
              label="Start / End Time"
              value={`${formatTime12hr(meeting.startTime || meeting.time)} - ${formatTime12hr(meeting.endTime || "")}`}
            />
            <InfoCard
              icon={<FiBriefcase className="size-4" />}
              label={`Related ${meeting.relatedToType || "Lead"}`}
              value={
                meeting.relatedToId ? (
                  <button
                    onClick={() =>
                      navigate(meeting.relatedToType === "Client" ? `/clients/${meeting.relatedToId}` : `/leads/${meeting.relatedToId}`)
                    }
                    className="text-brand-500 hover:underline flex items-center gap-1 text-left font-medium cursor-pointer"
                  >
                    {meeting.company}
                    <FiExternalLink className="size-3" />
                  </button>
                ) : (
                  meeting.company
                )
              }
            />
            <InfoCard
              icon={<FiUser className="size-4" />}
              label="Contact Person"
              value={meeting.contactPerson}
            />
            <InfoCard
              icon={<FiClock className="size-4" />}
              label="Duration & Timezone"
              value={`${meeting.duration || "—"} (${meeting.timezone || "IST"})`}
            />
            <InfoCard
              icon={<FiActivity className="size-4" />}
              label="Next Action Status"
              value={meeting.nextAction || "—"}
            />
          </div>
        </div>

        {/* Location & Link Info */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05]">
            Platform / Location
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoCard
              icon={<FiVideo className="size-4" />}
              label="Meeting Platform"
              value={meeting.meetingPlatform || meeting.type}
            />
            <div className="sm:col-span-2">
              <InfoCard
                icon={
                  ["Google Meet", "Zoom", "Microsoft Teams"].includes(meeting.meetingPlatform || meeting.type) ? (
                    <FiLink className="size-4 text-brand-500" />
                  ) : (
                    <FiMapPin className="size-4" />
                  )
                }
                label={
                  ["Google Meet", "Zoom", "Microsoft Teams"].includes(meeting.meetingPlatform || meeting.type)
                    ? "Meeting URL Link"
                    : "Venue / Physical Address"
                }
                value={
                  ["Google Meet", "Zoom", "Microsoft Teams"].includes(meeting.meetingPlatform || meeting.type) ? (
                    <a
                      href={meeting.linkOrLocation}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-500 hover:underline break-all flex items-center gap-1 font-medium"
                    >
                      {meeting.linkOrLocation}
                      <FiExternalLink className="size-3 shrink-0" />
                    </a>
                  ) : (
                    meeting.linkOrLocation
                  )
                }
              />
            </div>
          </div>
        </div>

        {/* Participants Panel */}
        <div className="sm:col-span-2 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05]">
            Participants
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <span className="block text-xs font-semibold text-gray-400 dark:text-gray-500 mb-2">
                Meeting Owners (Employees)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {meeting.meetingOwner && meeting.meetingOwner.length > 0 ? (
                  meeting.meetingOwner.map((owner) => (
                    <span
                      key={owner}
                      className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                      {owner}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-400">John Doe</span>
                )}
              </div>
            </div>

            <div>
              <span className="block text-xs font-semibold text-gray-400 dark:text-gray-500 mb-2">
                Client Contact Person
              </span>
              <span className="text-sm font-medium text-gray-800 dark:text-white/95">
                {meeting.clientContactPerson || meeting.contactPerson}
              </span>
            </div>

            <div>
              <span className="block text-xs font-semibold text-gray-400 dark:text-gray-500 mb-2">
                Attendees
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {meeting.attendees || "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Notes & Agenda Details */}
        <div className="sm:col-span-2 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05]">
            Agenda & Discussion details
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 dark:text-gray-500 mb-1">
                Agenda Purpose
              </label>
              <div className="p-3.5 rounded-lg bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.05]">
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                  {meeting.agenda || meeting.notes || "No agenda provided."}
                </p>
              </div>
            </div>
            {meeting.discussionPoints && (
              <div>
                <label className="block text-xs text-gray-400 dark:text-gray-500 mb-1">
                  Discussion Points
                </label>
                <div className="p-3.5 rounded-lg bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.05]">
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                    {meeting.discussionPoints}
                  </p>
                </div>
              </div>
            )}
            {meeting.requirements && (
              <div>
                <label className="block text-xs text-gray-400 dark:text-gray-500 mb-1">
                  Client Requirements
                </label>
                <div className="p-3.5 rounded-lg bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.05]">
                  <p className="text-sm text-gray-650 dark:text-gray-350 leading-relaxed whitespace-pre-wrap">
                    {meeting.requirements}
                  </p>
                </div>
              </div>
            )}
            {meeting.remarks && (
              <div>
                <label className="block text-xs text-gray-400 dark:text-gray-500 mb-1">
                  Remarks / Comments
                </label>
                <div className="p-3.5 rounded-lg bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.05]">
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                    {meeting.remarks}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Activity Log */}
        <div className="sm:col-span-2 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05] flex items-center gap-2">
            <FiActivity className="size-4 text-brand-500" />
            Activity Log
          </h3>
          {activityLogs.length > 0 ? (
            <div className="relative border-l-2 border-gray-100 dark:border-gray-850 ml-4 pl-6 space-y-6">
              {activityLogs.map((log) => (
                <div key={log.id} className="relative">
                  <span className="absolute -left-[31px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 ring-4 ring-white dark:ring-gray-900">
                    <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                  </span>
                  <div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 block mb-0.5">
                      {new Date(log.timestamp).toLocaleString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      • by {log.operator}
                    </span>
                    <p className="text-sm font-semibold text-gray-850 dark:text-white/90">
                      {log.action}
                    </p>
                    {log.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {log.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-gray-400">No logs found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Convert Lead to Client Modal */}
      <Modal
        isOpen={showConvertModal}
        onClose={() => setShowConvertModal(false)}
        className="max-w-[500px] m-4"
      >
        <div className="relative w-full rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
          <div className="mb-6 space-y-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-1">
                Convert Lead to Client
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Setup relationship profile and credit limits for <span className="font-semibold text-gray-850 dark:text-white/80">{matchingLead?.company}</span>.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Payment Terms
                </label>
                <Select
                  options={[
                    { value: "Net 15", label: "Net 15" },
                    { value: "Net 30", label: "Net 30" },
                    { value: "Net 45", label: "Net 45" },
                    { value: "Immediate", label: "Immediate" }
                  ]}
                  placeholder="Select terms"
                  defaultValue={paymentTerms}
                  onChange={(val) => setPaymentTerms(val)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Credit Limit (INR)
                </label>
                <Input
                  type="number"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value)}
                  placeholder="E.g., 500000"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Relationship Manager
                </label>
                <Select
                  options={[
                    { value: "John Doe", label: "John Doe" },
                    { value: "Jane Smith", label: "Jane Smith" },
                    { value: "Alice Johnson", label: "Alice Johnson" },
                    { value: "Robert Lee", label: "Robert Lee" }
                  ]}
                  placeholder="Select manager"
                  defaultValue={relManager}
                  onChange={(val) => setRelManager(val)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  Account Manager
                </label>
                <Select
                  options={[
                    { value: "John Doe", label: "John Doe" },
                    { value: "Jane Smith", label: "Jane Smith" },
                    { value: "Alice Johnson", label: "Alice Johnson" },
                    { value: "Robert Lee", label: "Robert Lee" }
                  ]}
                  placeholder="Select manager"
                  defaultValue={accManager}
                  onChange={(val) => setAccManager(val)}
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowConvertModal(false)}
              className="w-1/2"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConvertLeadConfirm}
              className="w-1/2 bg-success-600 hover:bg-success-700 text-white"
            >
              Convert to Client
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
