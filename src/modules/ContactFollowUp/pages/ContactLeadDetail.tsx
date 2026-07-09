import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useForm, Controller } from "react-hook-form";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Badge from "../../../components/ui/badge/Badge";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select";
import { Modal } from "../../../components/ui/modal";
import { useModal } from "../../../hooks/useModal";
import { initialLeads, getStatusColor } from "../../LeadManagement/data/leadsData";
import { FOLLOW_UP_REASONS, NOT_INTERESTED_REASONS } from "../data/contactData";
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
  FiFileText,
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiXCircle,
} from "react-icons/fi";

type ContactResult = "Interested" | "Call Later" | "Not Interested";

interface ContactOutcomeFormValues {
  followUpDate: string;
  followUpTime: string;
  followUpReason: string;
  notInterestedReason: string;
}

// Inline card component
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

export default function ContactLeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const contactModal = useModal();
  const successModal = useModal();
  const { showToast } = useToast();

  const lead = initialLeads.find((l) => l.id === Number(id));

  // Contact Result wizard selector state
  const [contactResult, setContactResult] = useState<ContactResult | null>(null);

  // Outcome display state
  const [savedOutcome, setSavedOutcome] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactOutcomeFormValues>({
    defaultValues: {
      followUpDate: "",
      followUpTime: "",
      followUpReason: "",
      notInterestedReason: "",
    },
  });

  const resetModal = () => {
    setContactResult(null);
    reset({
      followUpDate: "",
      followUpTime: "",
      followUpReason: "",
      notInterestedReason: "",
    });
  };

  const handleOpenContact = () => {
    resetModal();
    contactModal.openModal();
  };

  const handleSelectResult = (result: ContactResult) => {
    setContactResult(result);
  };

  const handleSaveInterested = () => {
    setSavedOutcome("Marked as Interested");
    showToast("Lead updated successfully.", "success");
    contactModal.closeModal();
    successModal.openModal();
  };

  const handleSaveCallLater = (data: ContactOutcomeFormValues) => {
    setSavedOutcome(`Follow-up scheduled for ${data.followUpDate} at ${data.followUpTime}`);
    showToast("Meeting scheduled successfully.", "success");
    contactModal.closeModal();
    successModal.openModal();
  };

  const handleSaveNotInterested = (data: ContactOutcomeFormValues) => {
    setSavedOutcome(`Marked as Not Interested — ${data.notInterestedReason}`);
    showToast("Lead updated successfully.", "success");
    contactModal.closeModal();
    successModal.openModal();
  };

  const handleFormError = () => {
    showToast("Please fill all required fields.", "error");
  };

  if (!lead) {
    return (
      <>
        <PageBreadcrumb pageTitle="Lead details" />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
            Lead not found
          </p>
          <Button size="sm" onClick={() => navigate("/contacts/my-leads")}>
            Back to my leads
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <PageMeta
        title="Lead Details | ClienZo"
        description="View lead details and log contact outcomes in ClienZo CRM."
      />
      <PageBreadcrumb pageTitle="Lead details" />

      {/* Top action bar */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => navigate("/contacts/my-leads")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:hover:text-white transition cursor-pointer"
        >
          <FiArrowLeft className="size-4" />
          Back to my leads
        </button>
        <Button
          size="sm"
          onClick={handleOpenContact}
          startIcon={<FiPhone className="size-4" />}
        >
          Log contact result
        </Button>
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
        <Badge size="md" color={getStatusColor(lead.status)}>
          {lead.status}
        </Badge>
      </div>

      {/* Outcome strip — shown after contact */}
      {savedOutcome && (
        <div className="flex items-center gap-2 mb-5 rounded-xl border border-success-200 bg-success-50 px-4 py-3 dark:border-success-500/20 dark:bg-success-500/10">
          <FiCheckCircle className="size-4 text-success-600 dark:text-success-400 shrink-0" />
          <span className="text-sm font-medium text-success-700 dark:text-success-400">
            {savedOutcome}
          </span>
        </div>
      )}

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Company Information */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05]">
            Company information
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoCard
              icon={<FiBriefcase className="size-4" />}
              label="Company Name"
              value={lead.company}
            />
            <InfoCard icon={<FiGlobe className="size-4" />} label="Website" value={lead.website} />
            <div className="sm:col-span-2">
              <InfoCard
                icon={<FiMapPin className="size-4" />}
                label="Address"
                value={lead.address}
              />
            </div>
            <InfoCard icon={<FiTag className="size-4" />} label="Industry" value={lead.industry} />
            <InfoCard icon={<FiTag className="size-4" />} label="Lead Source" value={lead.source} />
          </div>
        </div>

        {/* Contact Information */}
        <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05]">
            Contact information
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoCard icon={<FiUser className="size-4" />} label="Contact Person" value={lead.contactPerson} />
            <InfoCard
              icon={<FiUserCheck className="size-4" />}
              label="Assigned To"
              value={lead.assignedTo}
            />
            <InfoCard icon={<FiMail className="size-4" />} label="Email Address" value={lead.email} />
            <InfoCard icon={<FiPhone className="size-4" />} label="Phone Number" value={lead.phone} />
          </div>
        </div>

        {/* Notes / Agenda */}
        <div className="sm:col-span-2 rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05]">
            Lead notes / requirements
          </h3>
          <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3.5 dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-gray-800">
              <FiFileText className="size-4 text-gray-500" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {lead.notes || <span className="text-gray-400">No notes available for this lead.</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Log Contact Result Modal */}
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
                  onClick={() => handleSelectResult("Interested")}
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
                  onClick={() => handleSelectResult("Call Later")}
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
                  onClick={() => handleSelectResult("Not Interested")}
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

          {/* Step 2a: Interested — confirm */}
          {contactResult === "Interested" && (
            <>
              <div className="pr-10 border-b border-gray-150 pb-4 mb-6 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="size-5 text-success-500" />
                  <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">Interested</h4>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Confirm that <span className="font-medium text-gray-800 dark:text-white/90">{lead.contactPerson}</span> from{" "}
                <span className="font-medium text-gray-800 dark:text-white/90">{lead.company}</span> is interested in proceeding.
                The lead status will be updated to <span className="font-medium text-success-600">Qualified</span>.
              </p>
              <div className="flex items-center justify-end gap-3">
                <Button size="sm" variant="outline" onClick={() => setContactResult(null)}>Back</Button>
                <Button size="sm" onClick={handleSaveInterested}>Confirm</Button>
              </div>
            </>
          )}

          {/* Step 2b: Call Later — follow-up form */}
          {contactResult === "Call Later" && (
            <form onSubmit={handleSubmit(handleSaveCallLater, handleFormError)}>
              <div className="pr-10 border-b border-gray-150 pb-4 mb-6 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <FiClock className="size-5 text-warning-500" />
                  <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">Schedule follow-up</h4>
                </div>
              </div>

              <div className="space-y-4">
                {/* Date */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Date <span className="text-error-500">*</span>
                  </label>
                  <Controller
                    name="followUpDate"
                    control={control}
                    rules={{ required: "Date is required" }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="date"
                        className={errors.followUpDate ? "border-error-500" : ""}
                      />
                    )}
                  />
                  {errors.followUpDate && (
                    <span className="mt-1.5 text-xs text-error-600 block">{errors.followUpDate.message}</span>
                  )}
                </div>

                {/* Time */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Time <span className="text-error-500">*</span>
                  </label>
                  <Controller
                    name="followUpTime"
                    control={control}
                    rules={{ required: "Time is required" }}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="time"
                        className={errors.followUpTime ? "border-error-500" : ""}
                      />
                    )}
                  />
                  {errors.followUpTime && (
                    <span className="mt-1.5 text-xs text-error-600 block">{errors.followUpTime.message}</span>
                  )}
                </div>

                {/* Reason */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Reason <span className="text-error-500">*</span>
                  </label>
                  <Controller
                    name="followUpReason"
                    control={control}
                    rules={{ required: "Reason is required" }}
                    render={({ field: { onChange, value } }) => (
                      <Select
                        options={FOLLOW_UP_REASONS.map((r) => ({ value: r, label: r }))}
                        placeholder="Select reason"
                        onChange={onChange}
                        defaultValue={value}
                      />
                    )}
                  />
                  {errors.followUpReason && (
                    <span className="mt-1.5 text-xs text-error-600 block">{errors.followUpReason.message}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <Button size="sm" variant="outline" onClick={() => setContactResult(null)}>Back</Button>
                <Button size="sm" type="submit">Save follow-up</Button>
              </div>
            </form>
          )}

          {/* Step 2c: Not Interested — reason dropdown */}
          {contactResult === "Not Interested" && (
            <form onSubmit={handleSubmit(handleSaveNotInterested, handleFormError)}>
              <div className="pr-10 border-b border-gray-150 pb-4 mb-6 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <FiXCircle className="size-5 text-error-500" />
                  <h4 className="text-xl font-semibold text-gray-800 dark:text-white/90">Not interested</h4>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Reason <span className="text-error-500">*</span>
                </label>
                <Controller
                  name="notInterestedReason"
                  control={control}
                  rules={{ required: "Reason is required" }}
                  render={({ field: { onChange, value } }) => (
                    <Select
                      options={NOT_INTERESTED_REASONS.map((r) => ({ value: r, label: r }))}
                      placeholder="Select reason"
                      onChange={onChange}
                      defaultValue={value}
                    />
                  )}
                />
                {errors.notInterestedReason && (
                  <span className="mt-1.5 text-xs text-error-600 block">{errors.notInterestedReason.message}</span>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <Button size="sm" variant="outline" onClick={() => setContactResult(null)}>Back</Button>
                <Button size="sm" type="submit" className="bg-error-600 hover:bg-error-700">
                  Save
                </Button>
              </div>
            </form>
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
          <Button size="sm" onClick={successModal.closeModal} className="w-full">Done</Button>
        </div>
      </Modal>
    </>
  );
}
