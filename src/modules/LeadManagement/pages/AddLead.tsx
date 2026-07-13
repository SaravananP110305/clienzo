import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm, Controller } from "react-hook-form";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select";
import { LEAD_STATUSES, LEAD_PRIORITIES, ASSIGNEES, initialLeads, LeadStatus, LeadPriority, Lead } from "../data/leadsData";
import { useToast } from "../../../hooks/useToast";
import { LEAD_SOURCES, INDUSTRIES } from "../../Master/data/masterData";
import { getStorage, setStorage } from "../../../utils/storage";

interface LeadFormValues {
  company: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: LeadStatus | "";
  priority: LeadPriority | "";
  assignedTo: string;
  industry: string;
  source: string;
  website: string;
  address: string;
  notes: string;
}

export default function AddLead() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LeadFormValues>({
    mode: "onChange",
    defaultValues: {
      company: "",
      contactPerson: "",
      email: "",
      phone: "",
      status: "",
      priority: "",
      assignedTo: "",
      industry: "",
      source: "",
      website: "",
      address: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (isEditMode) {
      const currentLeads = getStorage<Lead[]>("clienzo_leads", initialLeads);
      const lead = currentLeads.find((l) => l.id === Number(id));
      if (lead) {
        reset({
          company: lead.company,
          contactPerson: lead.contactPerson,
          email: lead.email,
          phone: lead.phone.replace(/\D/g, "").slice(-10),
          status: lead.status,
          priority: lead.priority || "Medium",
          assignedTo: lead.assignedTo,
          industry: lead.industry || "",
          source: lead.source || "",
          website: lead.website || "",
          address: lead.address || "",
          notes: lead.notes || "",
        });
      }
    }
    setLoading(false);
  }, [id, isEditMode, reset]);

  const handleSave = (data: LeadFormValues) => {
    const currentLeads = getStorage<Lead[]>("clienzo_leads", initialLeads);
    if (isEditMode) {
      const updated = currentLeads.map((l) =>
        l.id === Number(id)
          ? {
              ...l,
              company: data.company,
              contactPerson: data.contactPerson,
              email: data.email,
              phone: data.phone,
              status: data.status as LeadStatus,
              priority: data.priority as LeadPriority,
              assignedTo: data.assignedTo,
              industry: data.industry,
              source: data.source,
              website: data.website,
              address: data.address,
              notes: data.notes,
            }
          : l
      );
      setStorage("clienzo_leads", updated);
      showToast("Lead updated successfully.", "success");
    } else {
      const nextId = currentLeads.length > 0 ? Math.max(...currentLeads.map((l) => l.id)) + 1 : 1;
      const newLead: Lead = {
        id: nextId,
        company: data.company,
        contactPerson: data.contactPerson,
        email: data.email,
        phone: data.phone,
        status: (data.status || "New") as LeadStatus,
        priority: (data.priority || "Medium") as LeadPriority,
        assignedTo: data.assignedTo || "John Doe",
        industry: data.industry,
        source: data.source,
        website: data.website,
        address: data.address,
        notes: data.notes,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setStorage("clienzo_leads", [...currentLeads, newLead]);
      showToast("Lead created successfully.", "success");
    }
    navigate("/leads");
  };

  const handleFormError = () => {
    showToast("Please fill all required fields.", "error");
  };

  const handleCancel = () => {
    navigate("/leads");
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading lead details...</div>;
  }

  return (
    <>
      <PageMeta
        title={isEditMode ? "Edit Lead | ClienZo" : "Add Lead | ClienZo"}
        description={isEditMode ? "Edit an existing lead in ClienZo CRM." : "Add a new lead to ClienZo CRM."}
      />
      <PageBreadcrumb pageTitle={isEditMode ? "Edit lead" : "Add lead"} />

      <form
        onSubmit={handleSubmit(handleSave, handleFormError)}
        className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-6"
      >
        {/* Section: Company Information */}
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05]">
          Company information
        </h3>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-6">
          {/* Company */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Company name <span className="text-error-500">*</span>
            </label>
            <Controller
              name="company"
              control={control}
              rules={{
                required: "Company name is required",
                pattern: {
                  value: /^[a-zA-Z0-9\s&.,-]+$/,
                  message: "Allow letters, numbers, spaces, &, ., -, and commas only",
                },
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
                  placeholder="Enter company name"
                  className={errors.company ? "border-error-500" : ""}
                />
              )}
            />
            {errors.company && (
              <span className="mt-1.5 text-xs text-error-600 block">{errors.company.message}</span>
            )}
          </div>

          {/* Industry */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Industry <span className="text-error-500">*</span>
            </label>
            <Controller
              name="industry"
              control={control}
              rules={{ required: "Industry is required" }}
              render={({ field: { value, onChange } }) => (
                <Select
                  options={getStorage("clienzo_master_industries", INDUSTRIES).filter(i => i.status === "Active").map(i => ({ value: i.name, label: i.name }))}
                  placeholder="Select industry"
                  onChange={onChange}
                  defaultValue={value}
                />
              )}
            />
            {errors.industry && (
              <span className="mt-1.5 text-xs text-error-600 block">{errors.industry.message}</span>
            )}
          </div>

          {/* Website */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Website
            </label>
            <Controller
              name="website"
              control={control}
              rules={{
                validate: (val) => {
                  if (!val) return true;
                  const urlPattern =
                    /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/;
                  return urlPattern.test(val) || "Please enter a valid website URL";
                },
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
                  placeholder="https://example.com"
                  className={errors.website ? "border-error-500" : ""}
                />
              )}
            />
            {errors.website && (
              <span className="mt-1.5 text-xs text-error-600 block">{errors.website.message}</span>
            )}
          </div>

          {/* Source */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Lead source <span className="text-error-500">*</span>
            </label>
            <Controller
              name="source"
              control={control}
              rules={{ required: "Lead source is required" }}
              render={({ field: { value, onChange } }) => (
                <Select
                  options={getStorage("clienzo_master_lead_sources", LEAD_SOURCES).filter(s => s.status === "Active").map(s => ({ value: s.name, label: s.name }))}
                  placeholder="Select source"
                  onChange={onChange}
                  defaultValue={value}
                />
              )}
            />
            {errors.source && (
              <span className="mt-1.5 text-xs text-error-600 block">{errors.source.message}</span>
            )}
          </div>

          {/* Address */}
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Address <span className="text-error-500">*</span>
            </label>
            <Controller
              name="address"
              control={control}
              rules={{ required: "Address is required" }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
                  placeholder="Enter full address"
                  className={errors.address ? "border-error-500" : ""}
                />
              )}
            />
            {errors.address && (
              <span className="mt-1.5 text-xs text-error-600 block">{errors.address.message}</span>
            )}
          </div>
        </div>

        {/* Section: Contact Information */}
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05]">
          Contact information
        </h3>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-6">
          {/* Contact Person */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Contact person <span className="text-error-500">*</span>
            </label>
            <Controller
              name="contactPerson"
              control={control}
              rules={{
                required: "Contact person is required",
                pattern: {
                  value: /^[a-zA-Z\s]+$/,
                  message: "Letters and spaces only",
                },
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
                  placeholder="Enter contact person name"
                  className={errors.contactPerson ? "border-error-500" : ""}
                />
              )}
            />
            {errors.contactPerson && (
              <span className="mt-1.5 text-xs text-error-600 block">
                {errors.contactPerson.message}
              </span>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email <span className="text-error-500">*</span>
            </label>
            <Controller
              name="email"
              control={control}
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "Please enter a valid email address.",
                },
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  type="email"
                  placeholder="contact@company.com"
                  className={errors.email ? "border-error-500" : ""}
                />
              )}
            />
            {errors.email && (
              <span className="mt-1.5 text-xs text-error-600 block">{errors.email.message}</span>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone <span className="text-error-500">*</span>
            </label>
            <Controller
              name="phone"
              control={control}
              rules={{
                required: "Phone number is required",
                pattern: {
                  value: /^[6-9]\d{9}$/,
                  message: "Please enter a valid 10-digit mobile number starting with 6-9.",
                },
              }}
              render={({ field: { value, onChange, ...rest } }) => (
                <Input
                  {...rest}
                  value={value}
                  type="text"
                  placeholder="Enter 10-digit phone number"
                  maxLength={10}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    onChange(digits);
                  }}
                  className={errors.phone ? "border-error-500" : ""}
                />
              )}
            />
            {errors.phone && (
              <span className="mt-1.5 text-xs text-error-600 block">{errors.phone.message}</span>
            )}
          </div>
        </div>

        {/* Section: Lead Details */}
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05]">
          Lead details
        </h3>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 mb-6">
          {/* Status */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Status <span className="text-error-500">*</span>
            </label>
            <Controller
              name="status"
              control={control}
              rules={{ required: "Status is required" }}
              render={({ field: { value, onChange } }) => (
                <Select
                  options={LEAD_STATUSES.map((s) => ({ value: s, label: s }))}
                  placeholder="Select status"
                  onChange={onChange}
                  defaultValue={value}
                />
              )}
            />
            {errors.status && (
              <span className="mt-1.5 text-xs text-error-600 block">{errors.status.message}</span>
            )}
          </div>

          {/* Assigned To */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Assigned to <span className="text-error-500">*</span>
            </label>
            <Controller
              name="assignedTo"
              control={control}
              rules={{ required: "Assigned to is required" }}
              render={({ field: { value, onChange } }) => (
                <Select
                  options={ASSIGNEES.map((a) => ({ value: a, label: a }))}
                  placeholder="Select assignee"
                  onChange={onChange}
                  defaultValue={value}
                />
              )}
            />
            {errors.assignedTo && (
              <span className="mt-1.5 text-xs text-error-600 block">
                {errors.assignedTo.message}
              </span>
            )}
          </div>

          {/* Priority */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Priority <span className="text-error-500">*</span>
            </label>
            <Controller
              name="priority"
              control={control}
              rules={{ required: "Priority is required" }}
              render={({ field: { value, onChange } }) => (
                <Select
                  options={LEAD_PRIORITIES.map((p) => ({ value: p, label: p }))}
                  placeholder="Select priority"
                  onChange={onChange}
                  defaultValue={value}
                />
              )}
            />
            {errors.priority && (
              <span className="mt-1.5 text-xs text-error-600 block">
                {errors.priority.message}
              </span>
            )}
          </div>

          {/* Notes */}
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Notes
            </label>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  placeholder="Add any relevant notes about this lead..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                />
              )}
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/[0.05]">
          <Button size="sm" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button size="sm" type="submit">
            Save lead
          </Button>
        </div>
      </form>
    </>
  );
}
