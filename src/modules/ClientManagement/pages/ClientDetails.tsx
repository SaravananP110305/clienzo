import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Badge from "../../../components/ui/badge/Badge";
import Button from "../../../components/ui/button/Button";
import { Client, initialClients } from "../data/clientsData";
import { Meeting, initialMeetings, getMeetingStatusColor } from "../../MeetingManagement/data/meetingsData";
import { getStorage } from "../../../utils/storage";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../../../components/ui/table";
import {
  FiBriefcase,
  FiUser,
  FiMail,
  FiPhone,
  FiGlobe,
  FiMapPin,
  FiCalendar,
  FiArrowLeft,
  FiActivity,
  FiDollarSign,
  FiCreditCard,
  FiPlus,
  FiExternalLink,
  FiShield,
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
        <span className="block text-xs text-gray-400 dark:text-gray-505 mb-0.5">
          {label}
        </span>
        <span className="block text-sm font-medium text-gray-850 dark:text-white/90 break-words">
          {value || <span className="text-gray-400 font-normal">—</span>}
        </span>
      </div>
    </div>
  );
}

export default function ClientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const clients = getStorage<Client[]>("saiflow_clients", initialClients);
  const client = clients.find((c) => c.id === Number(id));

  const meetings = getStorage<Meeting[]>("saiflow_meetings", initialMeetings);

  // Filter client's meetings
  const clientMeetings = useMemo(() => {
    if (!client) return [];
    return meetings.filter(
      (m) =>
        m.relatedToType === "Client" &&
        (m.relatedToId === client.id || m.company.toLowerCase() === client.company.toLowerCase())
    );
  }, [client, meetings]);

  const [activeTab, setActiveTab] = useState("overview");

  if (!client) {
    return (
      <>
        <PageBreadcrumb pageTitle="Client details" />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
            Client not found
          </p>
          <p className="text-sm text-gray-400 mb-6">
            The client you're looking for does not exist or has been deleted.
          </p>
          <Button size="sm" onClick={() => navigate("/clients")}>
            Back to client list
          </Button>
        </div>
      </>
    );
  }

  // Tab configurations
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "contacts", label: "Contacts" },
    { id: "meetings", label: "Meetings", count: clientMeetings.length },
    { id: "projects", label: "Projects", count: client.projectsCount || 0 },
    { id: "timeline", label: "Timeline" },
  ];

  const handleCreateMeeting = () => {
    navigate(`/meetings/add?relatedType=Client&relatedId=${client.id}`);
  };

  return (
    <>
      <PageMeta
        title={`Client Details: ${client.company} | SaiFlow`}
        description="View enterprise profile, meetings, contracts and payment terms."
      />
      <PageBreadcrumb pageTitle="Client details" />

      {/* Top Action Bar */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => navigate("/clients")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-white transition cursor-pointer"
        >
          <FiArrowLeft className="size-4" />
          Back to list
        </button>
        <Button
          size="sm"
          onClick={() => navigate(`/meetings/add?relatedType=Client&relatedId=${client.id}`)}
          startIcon={<FiPlus className="size-4" />}
        >
          Schedule meeting
        </Button>
      </div>

      {/* Summary Header Card */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-gray-200 bg-white px-6 py-5 mb-6 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white font-bold text-lg">
            {client.company.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-850 dark:text-white/95">
              {client.company}
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex flex-wrap gap-x-3 gap-y-1">
              <span>Client ID: SF-CLI-{String(client.id).padStart(4, "0")}</span>
              <span>•</span>
              <span>Contact: {client.name}</span>
              <span>•</span>
              <span>Email: {client.email}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge size="md" color={client.status === "Active" ? "success" : client.status === "Blacklisted" ? "error" : "warning"}>
            {client.status}
          </Badge>
        </div>
      </div>

      {/* Premium Tab Navigators */}
      <div className="border-b border-gray-200 dark:border-white/[0.05] mb-6 overflow-x-auto scrollbar-none">
        <nav className="flex min-w-max pb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-4 text-sm font-semibold border-b-2 transition-all duration-200 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-brand-500 text-brand-600 dark:text-brand-400"
                  : "border-transparent text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/[0.03] rounded-t-lg"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`inline-flex items-center justify-center min-w-[22px] h-[22px] rounded-full px-1.5 text-[11px] font-bold leading-none transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-brand-500 text-white shadow-xs"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Contents */}
      <div className="space-y-6">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Company Profile */}
            <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
              <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider">
                Company Profile
              </h3>
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <InfoCard icon={<FiBriefcase className="size-4" />} label="Industry" value={client.industry || "Information Technology"} />
                <InfoCard icon={<FiGlobe className="size-4" />} label="Website" value={client.website ? <a href={client.website} target="_blank" rel="noreferrer" className="text-brand-500 hover:underline inline-flex items-center gap-1">{client.website}<FiExternalLink className="size-3" /></a> : "—"} />
                <InfoCard icon={<FiShield className="size-4" />} label="GST Number" value={client.gstNumber} />
                <InfoCard icon={<FiShield className="size-4" />} label="PAN Number" value={client.panNumber || "AAAAA0000A"} />
                <InfoCard icon={<FiMail className="size-4" />} label="Company Email" value={client.companyEmail} />
                <InfoCard icon={<FiPhone className="size-4" />} label="Company Phone" value={client.companyPhone} />
              </div>
            </div>

            {/* Business Details */}
            <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
              <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider">
                Business details
              </h3>
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <InfoCard icon={<FiCalendar className="size-4" />} label="Client Since" value={client.clientSince || "2024-01-10"} />
                <InfoCard icon={<FiCreditCard className="size-4" />} label="Payment Terms" value={client.paymentTerms || "Net 30"} />
                <InfoCard icon={<FiDollarSign className="size-4" />} label="Credit Limit (INR)" value={client.creditLimit ? `₹${Number(client.creditLimit).toLocaleString()}` : "₹500,000"} />
                <InfoCard icon={<FiMail className="size-4" />} label="Preferred Communication" value={client.preferredCommunication || "Email"} />
              </div>
            </div>

            {/* Address Details */}
            <div className="md:col-span-2 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
              <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider">
                Address details
              </h3>
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                <div className="sm:col-span-3">
                  <InfoCard icon={<FiMapPin className="size-4" />} label="Office Address" value={client.address || "45 Tech Corridor, ITPL Road"} />
                </div>
                <InfoCard icon={<FiMapPin className="size-4" />} label="City" value={client.city || "Bangalore"} />
                <InfoCard icon={<FiMapPin className="size-4" />} label="State" value={client.state || "Karnataka"} />
                <InfoCard icon={<FiMapPin className="size-4" />} label="Pincode" value={client.pincode || "560066"} />
                <InfoCard icon={<FiGlobe className="size-4" />} label="Country" value={client.country || "India"} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "contacts" && (
          <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
            <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05] uppercase tracking-wider">
              Primary contact person
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoCard icon={<FiUser className="size-4" />} label="Contact Name" value={client.contactName || client.name} />
              <InfoCard icon={<FiBriefcase className="size-4" />} label="Designation" value={client.designation || "BD Director"} />
              <InfoCard icon={<FiPhone className="size-4" />} label="Mobile" value={client.mobile || client.phone} />
              <InfoCard icon={<FiMail className="size-4" />} label="Email" value={client.email ? <a href={`mailto:${client.email}`} className="text-brand-500 hover:underline">{client.email}</a> : "—"} />
            </div>

            <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-6 mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05] uppercase tracking-wider">
              Relationship assignment
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoCard icon={<FiUser className="size-4" />} label="Relationship Manager" value={client.relationshipManager || "John Doe"} />
              <InfoCard icon={<FiUser className="size-4" />} label="Account Manager" value={client.accountManager || "Jane Smith"} />
            </div>
          </div>
        )}

        {activeTab === "meetings" && (
          <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white/95">
                Client Meetings
              </h3>
              <Button size="sm" onClick={handleCreateMeeting} startIcon={<FiPlus className="size-3" />}>
                New Meeting
              </Button>
            </div>

            {clientMeetings.length > 0 ? (
              <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-white/[0.05]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableCell isHeader>Subject</TableCell>
                      <TableCell isHeader>Date / Time</TableCell>
                      <TableCell isHeader>Platform</TableCell>
                      <TableCell isHeader>Contact Person</TableCell>
                      <TableCell isHeader>Status</TableCell>
                      <TableCell isHeader className="text-right">Actions</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clientMeetings.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell className="font-semibold text-gray-800 dark:text-white/90">
                          {m.subject}
                        </TableCell>
                        <TableCell>
                          {m.date} at {m.time}
                        </TableCell>
                        <TableCell>
                          <Badge size="sm" color="info">
                            {m.meetingPlatform || m.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{m.contactPerson}</TableCell>
                        <TableCell>
                          <Badge size="sm" color={getMeetingStatusColor(m.status)}>
                            {m.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <button
                            onClick={() => navigate(`/meetings/${m.id}`)}
                            className="text-xs text-brand-500 hover:text-brand-600 font-semibold cursor-pointer"
                          >
                            Details
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl dark:border-white/[0.05]">
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                  No meetings have been scheduled for this client yet.
                </p>
                <Button size="sm" onClick={handleCreateMeeting}>
                  Schedule First Meeting
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Mock Project List */}
        {activeTab === "projects" && (
          <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-6">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white/95 mb-4">
              Client Projects
            </h3>
            {client.projectsCount > 0 ? (
              <div className="max-w-full overflow-x-auto custom-scrollbar">
                <Table>
                  <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                    <TableRow>
                      <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Project Name</TableCell>
                      <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Category</TableCell>
                      <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Status</TableCell>
                      <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Launch Date</TableCell>
                      <TableCell isHeader className="px-5 py-3 text-end text-theme-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Progress</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    <TableRow className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                      <TableCell className="px-5 py-4 text-theme-sm font-medium text-gray-800 dark:text-white/90 whitespace-nowrap">E-Commerce App Redesign</TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Mobile Application</TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm whitespace-nowrap">
                        <Badge size="sm" color="primary">In Progress</Badge>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">2026-09-01</TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-800 dark:text-white/90 text-end whitespace-nowrap">60%</TableCell>
                    </TableRow>
                    {client.projectsCount > 1 && (
                      <TableRow className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                        <TableCell className="px-5 py-4 text-theme-sm font-medium text-gray-800 dark:text-white/90 whitespace-nowrap">HR Portal Integration</TableCell>
                        <TableCell className="px-5 py-4 text-theme-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Web Application</TableCell>
                        <TableCell className="px-5 py-4 text-theme-sm whitespace-nowrap">
                          <Badge size="sm" color="success">Active</Badge>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-theme-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">2026-06-15</TableCell>
                        <TableCell className="px-5 py-4 text-theme-sm text-gray-800 dark:text-white/90 text-end whitespace-nowrap">100%</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl dark:border-white/[0.05]">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No active projects found for this client.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Timeline */}
        {activeTab === "timeline" && (
          <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05] flex items-center gap-2">
              <FiActivity className="size-4 text-brand-500" />
              Client Relationship Timeline
            </h3>
            <div className="relative border-l-2 border-gray-100 dark:border-gray-850 ml-4 pl-6 space-y-6">
              <div className="relative">
                <span className="absolute -left-[31px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 ring-4 ring-white dark:ring-gray-900">
                  <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                </span>
                <div>
                  <span className="text-xs text-gray-400 dark:text-gray-505 block mb-0.5">
                    {client.clientSince || "2024-01-10"}
                  </span>
                  <p className="text-sm font-semibold text-gray-850 dark:text-white/90">
                    Client Account Created
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Converted from qualified won lead. Relationship manager assigned: {client.relationshipManager || "John Doe"}.
                  </p>
                </div>
              </div>

              {clientMeetings.map((m) => (
                <div key={m.id} className="relative">
                  <span className="absolute -left-[31px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 ring-4 ring-white dark:ring-gray-900">
                    <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                  </span>
                  <div>
                    <span className="text-xs text-gray-400 dark:text-gray-505 block mb-0.5">
                      {m.date}
                    </span>
                    <p className="text-sm font-semibold text-gray-850 dark:text-white/90">
                      Meeting Held: {m.subject}
                    </p>
                    <p className="text-xs text-gray-505 dark:text-gray-400 mt-1">
                      Platform: {m.meetingPlatform || m.type}. Status: {m.status}.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
