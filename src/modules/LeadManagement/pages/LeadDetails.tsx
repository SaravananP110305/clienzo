import { useParams, useNavigate } from "react-router";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Badge from "../../../components/ui/badge/Badge";
import Button from "../../../components/ui/button/Button";
import { initialLeads, getStatusColor, Lead } from "../data/leadsData";
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

  const leads = getStorage<Lead[]>("clienzo_leads", initialLeads);
  const lead = leads.find((l) => l.id === Number(id));

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

  return (
    <>
      <PageMeta
        title="Lead Details | ClienZo"
        description="View detailed information about a lead in ClienZo CRM."
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
              onClick={() => navigate(`/meetings/add?leadId=${lead.id}`)}
              startIcon={<FiCalendar className="size-4" />}
            >
              Schedule meeting
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
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            {lead.company}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {lead.contactPerson}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge size="md" color={getStatusColor(lead.status)}>
            {lead.status}
          </Badge>
          <Badge size="md" color={lead.priority === "High" ? "error" : lead.priority === "Medium" ? "warning" : "info"}>
            {lead.priority || "Medium"} Priority
          </Badge>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

        {/* Company Information */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05]">
            Company information
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoCard
              icon={<FiBriefcase className="size-4" />}
              label="Company"
              value={lead.company}
            />
            <InfoCard
              icon={<FiTag className="size-4" />}
              label="Industry"
              value={lead.industry}
            />
            <InfoCard
              icon={<FiGlobe className="size-4" />}
              label="Website"
              value={
                lead.website ? (
                  <a
                    href={lead.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-500 hover:underline"
                  >
                    {lead.website}
                  </a>
                ) : (
                  "—"
                )
              }
            />
            <InfoCard
              icon={<FiMapPin className="size-4" />}
              label="Address"
              value={lead.address}
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05]">
            Contact information
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoCard
              icon={<FiUser className="size-4" />}
              label="Contact person"
              value={lead.contactPerson}
            />
            <InfoCard
              icon={<FiMail className="size-4" />}
              label="Email"
              value={
                <a
                  href={`mailto:${lead.email}`}
                  className="text-brand-500 hover:underline"
                >
                  {lead.email}
                </a>
              }
            />
            <InfoCard
              icon={<FiPhone className="size-4" />}
              label="Phone"
              value={lead.phone}
            />
          </div>
        </div>

        {/* Lead Details */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05]">
            Lead details
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoCard
              icon={<FiTag className="size-4" />}
              label="Source"
              value={lead.source}
            />
            <InfoCard
              icon={<FiUserCheck className="size-4" />}
              label="Assigned to"
              value={lead.assignedTo}
            />
            <InfoCard
              icon={<FiCalendar className="size-4" />}
              label="Created on"
              value={new Date(lead.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            />
            <InfoCard
              icon={<FiTag className="size-4" />}
              label="Status"
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
                <Badge size="sm" color={lead.priority === "High" ? "error" : lead.priority === "Medium" ? "warning" : "info"}>
                  {lead.priority || "Medium"}
                </Badge>
              }
            />
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05]">
            Notes
          </h3>
          <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3.5 dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-gray-800">
              <FiFileText className="size-4 text-gray-500 dark:text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {lead.notes || <span className="text-gray-400">No notes added.</span>}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
