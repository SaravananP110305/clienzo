import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Badge from "../../../components/ui/badge/Badge";
import Button from "../../../components/ui/button/Button";
import { initialLeads, getStatusColor, getPriorityColor, Lead } from "../data/leadsData";
import { initialFollowUps, type FollowUp } from "../../ContactFollowUp/data/contactData";
import { getStorage, setStorage } from "../../../utils/storage";
import { Client, initialClients } from "../../ClientManagement/data/clientsData";
import Select from "../../../components/form/Select";
import Input from "../../../components/form/input/InputField";
import { Modal } from "../../../components/ui/modal";
import { useToast } from "../../../hooks/useToast";
import {
  FiBriefcase,
  FiUser,
  FiMail,
  FiPhone,
  FiGlobe,
  FiMapPin,
  FiTag,
  FiUserCheck,
  FiCalendar,
  FiFileText,
  FiEdit,
  FiArrowLeft,
} from "react-icons/fi";

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | React.ReactNode;
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

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();



  const { showToast } = useToast();
  const leads = getStorage<Lead[]>("saiflow_leads", initialLeads);
  const lead = leads.find((l) => l.id === Number(id));

  // Convert Lead Modal state
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [paymentTerms, setPaymentTerms] = useState("Net 30");
  const [creditLimit, setCreditLimit] = useState("500000");
  const [relManager, setRelManager] = useState("John Doe");
  const [accManager, setAccManager] = useState("Jane Smith");

  const handleConvertLeadConfirm = () => {
    if (!lead) return;

    const clientsList = getStorage<Client[]>("saiflow_clients", initialClients);
    const exists = clientsList.some((c) => c.company.toLowerCase() === lead.company.toLowerCase());
    if (exists) {
      showToast(`A client with company name "${lead.company}" already exists.`, "error");
      setShowConvertModal(false);
      return;
    }

    const newClientId = clientsList.length > 0 ? Math.max(...clientsList.map((c) => c.id)) + 1 : 1;
    const newClient: Client = {
      id: newClientId,
      company: lead.company,
      name: lead.contactPerson,
      email: lead.email,
      phone: lead.phone,
      projectsCount: 0,
      status: "Active",
      industry: lead.industry,
      gstNumber: lead.gstNumber || "",
      panNumber: "",
      website: lead.website || "",
      companyEmail: lead.email,
      companyPhone: lead.phone,
      address: lead.addressLine1 || lead.address || "",
      city: lead.city || "",
      state: lead.state || "",
      country: lead.country || "India",
      pincode: lead.pincode || "",
      contactName: lead.contactPerson,
      designation: lead.designation || "",
      mobile: lead.phone,
      relationshipManager: relManager,
      accountManager: accManager,
      clientSince: new Date().toISOString().split("T")[0],
      paymentTerms: paymentTerms,
      preferredCommunication: lead.preferredContactMethod || "Email",
      creditLimit: creditLimit,
    };

    const updatedClients = [...clientsList, newClient];
    setStorage("saiflow_clients", updatedClients);

    // Update Lead to Won status
    const leadsList = getStorage<Lead[]>("saiflow_leads", initialLeads);
    const updatedLeads = leadsList.map((l) =>
      l.id === lead.id ? { ...l, status: "Won" as const } : l
    );
    setStorage("saiflow_leads", updatedLeads);

    showToast(`Lead converted to Client ${lead.company} successfully!`, "success");
    setShowConvertModal(false);
    navigate(`/clients/${newClientId}`);
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

  if (!lead) {
    return (
      <>
        <PageBreadcrumb pageTitle="Lead details" />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
            Lead not found
          </p>
          <p className="text-sm text-gray-400 mb-6">
            The lead you're looking for does not exist or has been deleted.
          </p>
          <Button size="sm" onClick={() => navigate("/leads")}>
            Back to lead list
          </Button>
        </div>
      </>
    );
  }

  const timelineEvents = useMemo(() => {
    if (!lead) return [];
    const events = [];
    
    // 1. Created Event
    events.push({
      date: new Date(lead.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      title: "Lead Created",
      description: `Lead for ${lead.company} was added to the system.`,
      timestamp: new Date(lead.createdAt).getTime()
    });

    // 2. Assigned Event
    if (lead.assignedTo) {
      events.push({
        date: new Date(lead.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        title: "Assigned Owner",
        description: `Lead assigned to ${lead.assignedTo}.`,
        timestamp: new Date(lead.createdAt).getTime() + 1000
      });
    }

    // 3. Meetings Events
    const allMeetings = getStorage<any[]>("saiflow_meetings", []);
    const relatedMeetings = allMeetings.filter(
      (m) => m.leadId === lead.id || m.company.toLowerCase() === lead.company.toLowerCase()
    );

    relatedMeetings.forEach((m) => {
      events.push({
        date: new Date(m.date + (m.time ? "T" + m.time : "")).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        title: `Meeting Scheduled (${m.type})`,
        description: `Status: ${m.status}. Agenda: ${m.title}`,
        timestamp: new Date(m.date + (m.time ? "T" + m.time : "")).getTime()
      });
    });

    // 4. Follow-up Events
    const allFollowups = getStorage<FollowUp[]>("saiflow_followups", initialFollowUps);
    const relatedFollowups = allFollowups.filter((f) => f.leadId === lead.id);

    relatedFollowups.forEach((f) => {
      const dateObj = new Date(f.date + "T" + (f.time || "09:00"));
      const timeStr = f.time ? ` at ${formatTime12hr(f.time)}` : "";
      events.push({
        date: dateObj.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        title: `Follow-up ${f.status}`,
        description: `Reason: ${f.reason}. Assigned to: ${f.assignedTo}${timeStr}`,
        timestamp: dateObj.getTime(),
      });
    });

    return events.sort((a, b) => b.timestamp - a.timestamp);
  }, [lead]);

  return (
    <>
      <PageMeta
        title="Lead Details | SaiFlow"
        description="View detailed information about a lead in SaiFlow CRM."
      />
      <PageBreadcrumb pageTitle="Lead details" />

      {/* Top action bar */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => navigate("/leads")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-white transition cursor-pointer"
        >
          <FiArrowLeft className="size-4" />
          Back to list
        </button>
        <div className="flex items-center gap-3">
          {lead.status === "Qualified" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/meetings/add?relatedType=Lead&relatedId=${lead.id}`)}
              startIcon={<FiCalendar className="size-4" />}
            >
              Schedule meeting
            </Button>
          )}
          {lead.status === "Won" && (
            <Button
              size="sm"
              onClick={() => setShowConvertModal(true)}
              className="bg-success-600 hover:bg-success-700 text-white"
            >
              Convert to Client
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => navigate(`/leads/${lead.id}/edit`)}
            startIcon={<FiEdit className="size-4" />}
          >
            Edit lead
          </Button>
        </div>
      </div>

      {/* Header Card */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-gray-200 bg-white px-6 py-5 mb-5 dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div>
          <h2 className="text-xl font-semibold text-gray-850 dark:text-white/95">
            {lead.leadTitle || `${lead.company} Expansion`}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5">
            <span className="font-medium text-gray-700 dark:text-gray-300">{lead.company}</span>
            <span className="text-gray-300 dark:text-gray-750">•</span>
            <span>{lead.contactPerson}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge size="md" color={getStatusColor(lead.status)}>
            {lead.status}
          </Badge>
          <Badge size="md" color={getPriorityColor(lead.priority)}>
            {lead.priority || "Medium"} Priority
          </Badge>
        </div>
      </div>

      {/* Cards Grid */}
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
              icon={<FiBriefcase className="size-4" />}
              label="Company Size"
              value={lead.companySize}
            />
            <InfoCard
              icon={<FiBriefcase className="size-4" />}
              label="Annual Revenue"
              value={lead.annualRevenue}
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
            <div className="sm:col-span-2">
              <InfoCard
                icon={<FiMapPin className="size-4" />}
                label="Address Line 2"
                value={lead.addressLine2}
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
            <InfoCard
              icon={<FiTag className="size-4" />}
              label="Expected Budget"
              value={lead.expectedBudget}
            />
            <InfoCard
              icon={<FiCalendar className="size-4" />}
              label="Expected Closing Date"
              value={
                lead.expectedClosingDate
                  ? new Date(lead.expectedClosingDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : ""
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

        {/* Card 7: Requirement */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5 sm:col-span-1 lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05]">
            Requirement
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoCard
              icon={<FiBriefcase className="size-4" />}
              label="Project Category"
              value={lead.projectCategory}
            />
            <InfoCard
              icon={<FiBriefcase className="size-4" />}
              label="Technology"
              value={
                lead.technologies && lead.technologies.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {lead.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="inline-flex items-center rounded-md bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                ) : (
                  ""
                )
              }
            />
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-400 dark:text-gray-500 mb-1">
                Requirement Summary
              </label>
              <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 dark:border-white/[0.05] dark:bg-white/[0.03]">
                <p className="text-sm text-gray-650 dark:text-gray-305 leading-relaxed whitespace-pre-line">
                  {lead.requirementSummary || lead.notes || "No requirement summary provided."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 8: Communication */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05]">
            Communication
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoCard
              icon={<FiMail className="size-4" />}
              label="Preferred Contact Method"
              value={lead.preferredContactMethod}
            />
            <InfoCard
              icon={<FiCalendar className="size-4" />}
              label="Preferred Contact Time"
              value={formatTime12hr(lead.preferredContactTime || "")}
            />
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05]">
            Activity Timeline
          </h3>
          {timelineEvents.length > 0 ? (
            <div className="relative border-l-2 border-gray-100 dark:border-gray-800 ml-4 pl-6 space-y-6">
              {timelineEvents.map((event, idx) => (
                <div key={idx} className="relative">
                  <span className="absolute -left-[31px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 ring-4 ring-white dark:ring-gray-900">
                    <span className="h-1.5 w-1.5 rounded-full bg-white"></span>
                  </span>
                  <div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 block mb-0.5">
                      {event.date}
                    </span>
                    <p className="text-sm font-semibold text-gray-850 dark:text-white/90">
                      {event.title}
                    </p>
                    {event.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-gray-400">No activities logged yet.</p>
            </div>
          )}
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
                  Setup relationship profile and credit limits for <span className="font-semibold text-gray-850 dark:text-white/80">{lead.company}</span>.
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
      </div>
    </>
  );
}
