import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm, Controller } from "react-hook-form";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select";
import { getStorage, setStorage } from "../../../utils/storage";
import { useToast } from "../../../hooks/useToast";
import { initialLeads, Lead, LeadStatus, LeadPriority } from "../data/leadsData";
import {
  LEAD_SOURCES,
  INDUSTRIES,
  COUNTRIES,
  STATES,
  CITIES,
  LEAD_STATUSES as MASTER_LEAD_STATUSES,
  PRIORITIES as MASTER_PRIORITIES,
} from "../../Master/data/masterData";

interface LeadFormValues {
  // Card 1
  leadTitle: string;
  company: string;
  contactPerson: string;
  designation: string;

  // Card 2
  phone: string;
  alternatePhone: string;
  email: string;
  alternateEmail: string;
  website: string;

  // Card 3
  industry: string;
  gstNumber: string;

  // Card 4
  addressLine1: string;
  country: string;
  state: string;
  city: string;
  pincode: string;

  // Card 5
  source: string;
  status: string;
  priority: string;

  // Card 6
  assignedTo: string;
  assignedDate: string;

  // Card 7
  nextFollowUpDate: string;
  followUpType: string;
  followUpNotes: string;

  // Card 8
  remarks: string;
}

export default function AddLead() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);

  // Data sources setup from master configuration
  const sourceOptions = getStorage("saiflow_master_lead_sources", LEAD_SOURCES)
    .filter((x: any) => x.status === "Active")
    .map((x: any) => ({ value: x.name, label: x.name }));

  const statusOptions = getStorage("saiflow_master_lead_statuses", MASTER_LEAD_STATUSES)
    .filter((x: any) => x.status === "Active")
    .map((x: any) => ({ value: x.name, label: x.name }));

  const priorityOptions = getStorage("saiflow_master_priorities", MASTER_PRIORITIES)
    .filter((x: any) => x.status === "Active")
    .map((x: any) => ({ value: x.name, label: x.name }));

  const countryOptions = getStorage("saiflow_master_countries", COUNTRIES)
    .filter((x: any) => x.status === "Active")
    .map((x: any) => ({ value: x.name, label: x.name }));

  const stateOptions = getStorage("saiflow_master_states", STATES)
    .filter((x: any) => x.status === "Active")
    .map((x: any) => ({ value: x.name, label: x.name }));

  const cityOptions = getStorage("saiflow_master_cities", CITIES)
    .filter((x: any) => x.status === "Active")
    .map((x: any) => ({ value: x.name, label: x.name }));

  const industryOptions = getStorage("saiflow_master_industries", INDUSTRIES)
    .filter((x: any) => x.status === "Active")
    .map((x: any) => ({ value: x.name, label: x.name }));

  // Employee data from user management list
  const employeeOptions = getStorage("saiflow_users", [
    { name: "John Doe", status: "Active" },
    { name: "Jane Smith", status: "Active" },
    { name: "Alice Johnson", status: "Active" },
    { name: "Robert Lee", status: "Active" },
  ])
    .filter((x: any) => x.status === "Active")
    .map((x: any) => ({ value: x.name, label: x.name }));

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeadFormValues>({
    mode: "onChange",
    defaultValues: {
      leadTitle: "",
      company: "",
      contactPerson: "",
      designation: "",
      phone: "",
      alternatePhone: "",
      email: "",
      alternateEmail: "",
      website: "",
      industry: "",
      gstNumber: "",
      addressLine1: "",
      country: "",
      state: "",
      city: "",
      pincode: "",
      source: "",
      status: "",
      priority: "",
      assignedTo: "",
      assignedDate: "",
      nextFollowUpDate: "",
      followUpType: "",
      followUpNotes: "",
      remarks: "",
    },
  });

  useEffect(() => {
    const currentLeads = getStorage<Lead[]>("saiflow_leads", initialLeads);
    if (isEditMode) {
      const lead = currentLeads.find((l) => l.id === Number(id));
      if (lead) {
        reset({
          leadTitle: lead.leadTitle || `${lead.company} Expansion`,
          company: lead.company,
          contactPerson: lead.contactPerson,
          designation: lead.designation || "",
          phone: lead.phone.replace(/\D/g, "").slice(-10),
          alternatePhone: lead.alternatePhone || "",
          email: lead.email,
          alternateEmail: lead.alternateEmail || "",
          website: lead.website || "",
          industry: lead.industry || "",
          gstNumber: lead.gstNumber || "",
          addressLine1: lead.addressLine1 || lead.address || "",
          country: lead.country || "",
          state: lead.state || "",
          city: lead.city || "",
          pincode: lead.pincode || "",
          source: lead.source || "",
          status: lead.status || "New",
          priority: lead.priority || "Medium",
          assignedTo: lead.assignedTo || "",
          assignedDate: lead.assignedDate || "",
          nextFollowUpDate: lead.nextFollowUpDate || "",
          followUpType: lead.followUpType || "",
          followUpNotes: lead.followUpNotes || "",
          remarks: lead.remarks || "",
        });
      }
    }
    setLoading(false);
  }, [id, isEditMode, reset]);

  const handleSave = (data: LeadFormValues) => {
    const currentLeads = getStorage<Lead[]>("saiflow_leads", initialLeads);
    if (isEditMode) {
      const updated = currentLeads.map((l) =>
        l.id === Number(id)
          ? {
            ...l,
            leadTitle: data.leadTitle.trim(),
            company: data.company.trim(),
            contactPerson: data.contactPerson.trim(),
            designation: data.designation.trim(),
            phone: data.phone,
            alternatePhone: data.alternatePhone,
            email: data.email.trim(),
            alternateEmail: data.alternateEmail,
            website: data.website.trim(),
            industry: data.industry,
            gstNumber: data.gstNumber,
            addressLine1: data.addressLine1.trim(),
            address: data.addressLine1.trim(),
            country: data.country,
            state: data.state,
            city: data.city,
            pincode: data.pincode,
            source: data.source,
            status: data.status as LeadStatus,
            priority: data.priority as LeadPriority,
            assignedTo: data.assignedTo,
            assignedDate: data.assignedDate,
            nextFollowUpDate: data.nextFollowUpDate,
            followUpType: data.followUpType,
            followUpNotes: data.followUpNotes,
            remarks: data.remarks,
          }
          : l
      );
      setStorage("saiflow_leads", updated);
      showToast("Lead updated successfully.", "success");
    } else {
      const nextId = currentLeads.length > 0 ? Math.max(...currentLeads.map((l) => l.id)) + 1 : 1;
      const newLead: Lead = {
        id: nextId,
        leadTitle: data.leadTitle.trim(),
        company: data.company.trim(),
        contactPerson: data.contactPerson.trim(),
        designation: data.designation.trim(),
        phone: data.phone,
        alternatePhone: data.alternatePhone,
        email: data.email.trim(),
        alternateEmail: data.alternateEmail,
        website: data.website.trim(),
        industry: data.industry,
        gstNumber: data.gstNumber,
        addressLine1: data.addressLine1.trim(),
        address: data.addressLine1.trim(),
        country: data.country,
        state: data.state,
        city: data.city,
        pincode: data.pincode,
        source: data.source,
        status: (data.status || "New") as LeadStatus,
        priority: (data.priority || "Medium") as LeadPriority,
        assignedTo: data.assignedTo || "John Doe",
        assignedDate: data.assignedDate,
        nextFollowUpDate: data.nextFollowUpDate,
        followUpType: data.followUpType,
        followUpNotes: data.followUpNotes,
        remarks: data.remarks,
        notes: "",
        createdAt: new Date().toISOString().split("T")[0],
      };
      setStorage("saiflow_leads", [...currentLeads, newLead]);
      showToast("Lead created successfully.", "success");
    }
    navigate("/leads");
  };

  const handleFormError = () => {
    showToast("Please fill all required fields correctly.", "error");
  };

  const handleCancel = () => {
    navigate("/leads");
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading details...</div>;
  }

  return (
    <>
      <PageMeta
        title={isEditMode ? "Edit Lead | SaiFlow" : "Add Lead | SaiFlow"}
        description={isEditMode ? "Edit an existing lead in SaiFlow CRM." : "Add a new lead to SaiFlow CRM."}
      />
      <PageBreadcrumb pageTitle={isEditMode ? "Edit lead" : "Add lead"} />

      <form onSubmit={handleSubmit(handleSave, handleFormError)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Lead Information */}
          <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white/95 mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05]">
              Lead Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Lead Title <span className="text-error-500">*</span>
                </label>
                <Controller
                  name="leadTitle"
                  control={control}
                  rules={{ required: "Lead title is required" }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      placeholder="e.g. ERP Implementation"
                      error={!!errors.leadTitle}
                    />
                  )}
                />
                {errors.leadTitle && (
                  <span className="mt-1 text-xs text-error-600 block">
                    {errors.leadTitle.message}
                  </span>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Company Name <span className="text-error-500">*</span>
                </label>
                <Controller
                  name="company"
                  control={control}
                  rules={{ required: "Company name is required" }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      placeholder="Enter company name"
                      error={!!errors.company}
                    />
                  )}
                />
                {errors.company && (
                  <span className="mt-1 text-xs text-error-600 block">
                    {errors.company.message}
                  </span>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Contact Person <span className="text-error-500">*</span>
                </label>
                <Controller
                  name="contactPerson"
                  control={control}
                  rules={{ required: "Contact person is required" }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      placeholder="Enter contact person"
                      error={!!errors.contactPerson}
                    />
                  )}
                />
                {errors.contactPerson && (
                  <span className="mt-1 text-xs text-error-600 block">
                    {errors.contactPerson.message}
                  </span>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Designation
                </label>
                <Controller
                  name="designation"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} type="text" placeholder="e.g. Chief Technology Officer" />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Contact Details */}
          <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white/95 mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05]">
              Contact Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Mobile Number <span className="text-error-500">*</span>
                </label>
                <Controller
                  name="phone"
                  control={control}
                  rules={{
                    required: "Mobile number is required",
                    pattern: {
                      value: /^[6-9]\d{9}$/,
                      message: "Please enter a valid 10-digit mobile number",
                    },
                  }}
                  render={({ field: { value, onChange, ...rest } }) => (
                    <Input
                      {...rest}
                      value={value}
                      type="text"
                      placeholder="Enter 10-digit number"
                      maxLength={10}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "");
                        onChange(digits);
                      }}
                      error={!!errors.phone}
                    />
                  )}
                />
                {errors.phone && (
                  <span className="mt-1 text-xs text-error-600 block">{errors.phone.message}</span>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Alternate Mobile
                </label>
                <Controller
                  name="alternatePhone"
                  control={control}
                  render={({ field: { value, onChange, ...rest } }) => (
                    <Input
                      {...rest}
                      value={value}
                      type="text"
                      placeholder="Enter alternate number"
                      maxLength={15}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "");
                        onChange(digits);
                      }}
                    />
                  )}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address <span className="text-error-500">*</span>
                </label>
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: "Email address is required",
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: "Please enter a valid email address",
                    },
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="email"
                      placeholder="example@company.com"
                      error={!!errors.email}
                    />
                  )}
                />
                {errors.email && (
                  <span className="mt-1 text-xs text-error-600 block">{errors.email.message}</span>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Alternate Email
                </label>
                <Controller
                  name="alternateEmail"
                  control={control}
                  rules={{
                    pattern: {
                      value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                      message: "Please enter a valid email address",
                    },
                  }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="email"
                      placeholder="alt@company.com"
                      error={!!errors.alternateEmail}
                    />
                  )}
                />
                {errors.alternateEmail && (
                  <span className="mt-1 text-xs text-error-600 block">
                    {errors.alternateEmail.message}
                  </span>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Website
                </label>
                <Controller
                  name="website"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} type="text" placeholder="https://example.com" />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Card 3: Company Details */}
          <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white/95 mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05]">
              Company Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Industry
                </label>
                <Controller
                  name="industry"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <Select
                      options={industryOptions}
                      placeholder="Select industry"
                      onChange={onChange}
                      defaultValue={value}
                    />
                  )}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  GST Number
                </label>
                <Controller
                  name="gstNumber"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} type="text" placeholder="22AAAAA0000A1Z5" />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Card 4: Address */}
          <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white/95 mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05]">
              Address
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Address Line <span className="text-error-500">*</span>
                </label>
                <Controller
                  name="addressLine1"
                  control={control}
                  rules={{ required: "Address line 1 is required" }}
                  render={({ field }) => (
                    <Input {...field} type="text" placeholder="Floor, block, street address" error={!!errors.addressLine1} />
                  )}
                />
                {errors.addressLine1 && (
                  <span className="mt-1 text-xs text-error-600 block">{errors.addressLine1.message}</span>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Country <span className="text-error-500">*</span>
                </label>
                <Controller
                  name="country"
                  control={control}
                  rules={{ required: "Country is required" }}
                  render={({ field: { value, onChange } }) => (
                    <Select
                      options={countryOptions}
                      placeholder="Select country"
                      onChange={onChange}
                      defaultValue={value}
                    />
                  )}
                />
                {errors.country && (
                  <span className="mt-1 text-xs text-error-600 block">{errors.country.message}</span>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  State <span className="text-error-500">*</span>
                </label>
                <Controller
                  name="state"
                  control={control}
                  rules={{ required: "State is required" }}
                  render={({ field: { value, onChange } }) => (
                    <Select
                      options={stateOptions}
                      placeholder="Select state"
                      onChange={onChange}
                      defaultValue={value}
                    />
                  )}
                />
                {errors.state && (
                  <span className="mt-1 text-xs text-error-600 block">{errors.state.message}</span>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  City <span className="text-error-500">*</span>
                </label>
                <Controller
                  name="city"
                  control={control}
                  rules={{ required: "City is required" }}
                  render={({ field: { value, onChange } }) => (
                    <Select
                      options={cityOptions}
                      placeholder="Select city"
                      onChange={onChange}
                      defaultValue={value}
                    />
                  )}
                />
                {errors.city && (
                  <span className="mt-1 text-xs text-error-600 block">{errors.city.message}</span>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Pincode
                </label>
                <Controller
                  name="pincode"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} type="text" placeholder="e.g. 560001" maxLength={8} />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Card 5: Lead Details */}
          <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white/95 mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05]">
              Lead Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Lead Source <span className="text-error-500">*</span>
                </label>
                <Controller
                  name="source"
                  control={control}
                  rules={{ required: "Lead source is required" }}
                  render={({ field: { value, onChange } }) => (
                    <Select
                      options={sourceOptions}
                      placeholder="Select source"
                      onChange={onChange}
                      defaultValue={value}
                    />
                  )}
                />
                {errors.source && (
                  <span className="mt-1 text-xs text-error-600 block">{errors.source.message}</span>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Lead Status <span className="text-error-500">*</span>
                </label>
                <Controller
                  name="status"
                  control={control}
                  rules={{ required: "Lead status is required" }}
                  render={({ field: { value, onChange } }) => (
                    <Select
                      options={statusOptions}
                      placeholder="Select status"
                      onChange={onChange}
                      defaultValue={value}
                    />
                  )}
                />
                {errors.status && (
                  <span className="mt-1 text-xs text-error-600 block">{errors.status.message}</span>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Priority <span className="text-error-500">*</span>
                </label>
                <Controller
                  name="priority"
                  control={control}
                  rules={{ required: "Priority is required" }}
                  render={({ field: { value, onChange } }) => (
                    <Select
                      options={priorityOptions}
                      placeholder="Select priority"
                      onChange={onChange}
                      defaultValue={value}
                    />
                  )}
                />
                {errors.priority && (
                  <span className="mt-1 text-xs text-error-600 block">{errors.priority.message}</span>
                )}
              </div>
            </div>
          </div>

          {/* Card 6: Assignment */}
          <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white/95 mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05]">
              Assignment
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Lead Owner <span className="text-error-500">*</span>
                </label>
                <Controller
                  name="assignedTo"
                  control={control}
                  rules={{ required: "Lead owner is required" }}
                  render={({ field: { value, onChange } }) => (
                    <Select
                      options={employeeOptions}
                      placeholder="Select lead owner"
                      onChange={onChange}
                      defaultValue={value}
                    />
                  )}
                />
                {errors.assignedTo && (
                  <span className="mt-1 text-xs text-error-600 block">{errors.assignedTo.message}</span>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Assigned Date
                </label>
                <Controller
                  name="assignedDate"
                  control={control}
                  render={({ field }) => <Input {...field} type="date" />}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <Button size="sm" type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button size="sm" type="submit">
            {isEditMode ? "Update" : "Save"}
          </Button>
        </div>
      </form>
    </>
  );
}
