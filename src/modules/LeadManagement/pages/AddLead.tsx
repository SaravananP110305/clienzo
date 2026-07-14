import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { FiChevronDown } from "react-icons/fi";
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
  TECHNOLOGIES,
  PROJECT_CATEGORIES,
  LEAD_STATUSES as MASTER_LEAD_STATUSES,
  PRIORITIES as MASTER_PRIORITIES,
} from "../../Master/data/masterData";

interface LeadFormValues {
  // Card 1
  leadId: string;
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
  companySize: string;
  annualRevenue: string;
  gstNumber: string;

  // Card 4
  addressLine1: string;
  addressLine2: string;
  country: string;
  state: string;
  city: string;
  pincode: string;

  // Card 5
  source: string;
  status: string;
  priority: string;
  expectedBudget: string;
  expectedClosingDate: string;

  // Card 6
  assignedTo: string;
  assignedDate: string;

  // Card 7
  projectCategory: string;
  technologies: string[];
  requirementSummary: string;

  // Card 8
  preferredContactMethod: string;
  preferredContactTime: string;

  // Card 9
  nextFollowUpDate: string;
  followUpType: string;
  followUpNotes: string;

  // Card 10
  remarks: string;
}

export default function AddLead() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [generatedLeadId, setGeneratedLeadId] = useState("");

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

  const categoryOptions = getStorage("saiflow_master_project_categories", PROJECT_CATEGORIES)
    .filter((x: any) => x.status === "Active")
    .map((x: any) => ({ value: x.name, label: x.name }));

  const techOptions = getStorage("saiflow_master_technologies", TECHNOLOGIES)
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
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<LeadFormValues>({
    mode: "onChange",
    defaultValues: {
      leadId: "",
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
      companySize: "",
      annualRevenue: "",
      gstNumber: "",
      addressLine1: "",
      addressLine2: "",
      country: "",
      state: "",
      city: "",
      pincode: "",
      source: "",
      status: "",
      priority: "",
      expectedBudget: "",
      expectedClosingDate: "",
      assignedTo: "",
      assignedDate: "",
      projectCategory: "",
      technologies: [],
      requirementSummary: "",
      preferredContactMethod: "",
      preferredContactTime: "",
      nextFollowUpDate: "",
      followUpType: "",
      followUpNotes: "",
      remarks: "",
    },
  });

  const selectedTechs = watch("technologies") || [];
  const [techDropdownOpen, setTechDropdownOpen] = useState(false);
  const [techSearch, setTechSearch] = useState("");
  const techContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (techContainerRef.current && !techContainerRef.current.contains(event.target as Node)) {
        setTechDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const currentLeads = getStorage<Lead[]>("saiflow_leads", initialLeads);
    if (isEditMode) {
      const lead = currentLeads.find((l) => l.id === Number(id));
      if (lead) {
        setGeneratedLeadId(`SF-LEAD-${String(lead.id).padStart(4, "0")}`);
        reset({
          leadId: `SF-LEAD-${String(lead.id).padStart(4, "0")}`,
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
          companySize: lead.companySize || "",
          annualRevenue: lead.annualRevenue || "",
          gstNumber: lead.gstNumber || "",
          addressLine1: lead.addressLine1 || lead.address || "",
          addressLine2: lead.addressLine2 || "",
          country: lead.country || "",
          state: lead.state || "",
          city: lead.city || "",
          pincode: lead.pincode || "",
          source: lead.source || "",
          status: lead.status || "New",
          priority: lead.priority || "Medium",
          expectedBudget: lead.expectedBudget || "",
          expectedClosingDate: lead.expectedClosingDate || "",
          assignedTo: lead.assignedTo || "",
          assignedDate: lead.assignedDate || "",
          projectCategory: lead.projectCategory || "",
          technologies: lead.technologies || [],
          requirementSummary: lead.requirementSummary || lead.notes || "",
          preferredContactMethod: lead.preferredContactMethod || "",
          preferredContactTime: lead.preferredContactTime || "",
          nextFollowUpDate: lead.nextFollowUpDate || "",
          followUpType: lead.followUpType || "",
          followUpNotes: lead.followUpNotes || "",
          remarks: lead.remarks || "",
        });
      }
    } else {
      const nextId = currentLeads.length > 0 ? Math.max(...currentLeads.map((l) => l.id)) + 1 : 1;
      const formattedId = `SF-LEAD-${String(nextId).padStart(4, "0")}`;
      setGeneratedLeadId(formattedId);
      setValue("leadId", formattedId);
    }
    setLoading(false);
  }, [id, isEditMode, reset, setValue]);

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
              companySize: data.companySize,
              annualRevenue: data.annualRevenue,
              gstNumber: data.gstNumber,
              addressLine1: data.addressLine1.trim(),
              addressLine2: data.addressLine2.trim(),
              address: `${data.addressLine1} ${data.addressLine2}`.trim(),
              country: data.country,
              state: data.state,
              city: data.city,
              pincode: data.pincode,
              source: data.source,
              status: data.status as LeadStatus,
              priority: data.priority as LeadPriority,
              expectedBudget: data.expectedBudget,
              expectedClosingDate: data.expectedClosingDate,
              assignedTo: data.assignedTo,
              assignedDate: data.assignedDate,
              projectCategory: data.projectCategory,
              technologies: data.technologies,
              requirementSummary: data.requirementSummary,
              notes: data.requirementSummary,
              preferredContactMethod: data.preferredContactMethod,
              preferredContactTime: data.preferredContactTime,
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
        companySize: data.companySize,
        annualRevenue: data.annualRevenue,
        gstNumber: data.gstNumber,
        addressLine1: data.addressLine1.trim(),
        addressLine2: data.addressLine2.trim(),
        address: `${data.addressLine1} ${data.addressLine2}`.trim(),
        country: data.country,
        state: data.state,
        city: data.city,
        pincode: data.pincode,
        source: data.source,
        status: (data.status || "New") as LeadStatus,
        priority: (data.priority || "Medium") as LeadPriority,
        expectedBudget: data.expectedBudget,
        expectedClosingDate: data.expectedClosingDate,
        assignedTo: data.assignedTo || "John Doe",
        assignedDate: data.assignedDate,
        projectCategory: data.projectCategory,
        technologies: data.technologies,
        requirementSummary: data.requirementSummary,
        notes: data.requirementSummary,
        preferredContactMethod: data.preferredContactMethod,
        preferredContactTime: data.preferredContactTime,
        nextFollowUpDate: data.nextFollowUpDate,
        followUpType: data.followUpType,
        followUpNotes: data.followUpNotes,
        remarks: data.remarks,
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
                  Lead ID
                </label>
                <Input type="text" value={generatedLeadId} disabled />
              </div>
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
                  Company Size
                </label>
                <Controller
                  name="companySize"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <Select
                      options={[
                        { value: "1-10", label: "1-10 employees" },
                        { value: "11-50", label: "11-50 employees" },
                        { value: "51-200", label: "51-200 employees" },
                        { value: "201-500", label: "201-500 employees" },
                        { value: "501+", label: "501+ employees" },
                      ]}
                      placeholder="Select company size"
                      onChange={onChange}
                      defaultValue={value}
                    />
                  )}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Annual Revenue
                </label>
                <Controller
                  name="annualRevenue"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} type="text" placeholder="e.g. $2.5M" />
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
                  Address Line 1 <span className="text-error-500">*</span>
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
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Address Line 2
                </label>
                <Controller
                  name="addressLine2"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} type="text" placeholder="Apartment, suite, unit (optional)" />
                  )}
                />
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
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Expected Budget
                </label>
                <Controller
                  name="expectedBudget"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} type="text" placeholder="e.g. $15,000" />
                  )}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Expected Closing Date
                </label>
                <Controller
                  name="expectedClosingDate"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} type="date" className="custom-calendar-input" />
                  )}
                />
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

          {/* Card 7: Requirement */}
          <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] md:col-span-2 p-5">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white/95 mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05]">
              Requirement
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Project Category
                </label>
                <Controller
                  name="projectCategory"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <Select
                      options={categoryOptions}
                      placeholder="Select project category"
                      onChange={onChange}
                      defaultValue={value}
                    />
                  )}
                />
              </div>
              <div className="relative" ref={techContainerRef}>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Technology (Multi Select)
                </label>
                <button
                  type="button"
                  onClick={() => setTechDropdownOpen(!techDropdownOpen)}
                  className="flex h-11 w-full items-center justify-between rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-left text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                >
                  <span className="truncate">
                    {selectedTechs.length > 0
                      ? selectedTechs.join(", ")
                      : "Select technologies..."}
                  </span>
                  <FiChevronDown
                    className={`size-4 text-gray-500 transition-transform shrink-0 ml-2 ${
                      techDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {techDropdownOpen && (
                  <div className="absolute left-0 right-0 z-50 mt-1 rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-900 max-h-60 overflow-y-auto">
                    <input
                      type="text"
                      placeholder="Search technologies..."
                      value={techSearch}
                      onChange={(e) => setTechSearch(e.target.value)}
                      className="mb-2 h-9 w-full rounded-md border border-gray-250 bg-transparent px-3 py-1 text-xs text-gray-850 placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-2 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
                    />

                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {techOptions
                        .filter((tech: any) =>
                          tech.label.toLowerCase().includes(techSearch.toLowerCase())
                        )
                        .map((tech: any) => (
                          <label
                            key={tech.value}
                            className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 dark:hover:bg-white/[0.03] cursor-pointer text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:white transition"
                          >
                            <input
                              type="checkbox"
                              checked={selectedTechs.includes(tech.value)}
                              onChange={(e) => {
                                const updated = e.target.checked
                                  ? [...selectedTechs, tech.value]
                                  : selectedTechs.filter((t: string) => t !== tech.value);
                                setValue("technologies", updated);
                              }}
                              className="rounded border-gray-300 text-brand-500 focus:ring-brand-500 cursor-pointer"
                            />
                            <span>{tech.label}</span>
                          </label>
                        ))}
                      {techOptions.filter((tech: any) =>
                        tech.label.toLowerCase().includes(techSearch.toLowerCase())
                      ).length === 0 && (
                        <p className="text-xs text-gray-400 text-center py-2">No results found</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Requirement Summary
                </label>
                <Controller
                  name="requirementSummary"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      placeholder="Summarize project requirements..."
                      rows={3}
                      className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Card 8: Communication */}
          <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-5">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white/95 mb-4 pb-2 border-b border-gray-100 dark:border-white/[0.05]">
              Communication
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Preferred Contact Method
                </label>
                <Controller
                  name="preferredContactMethod"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <Select
                      options={[
                        { value: "Phone", label: "Phone" },
                        { value: "WhatsApp", label: "WhatsApp" },
                        { value: "Email", label: "Email" },
                        { value: "Google Meet", label: "Google Meet" },
                        { value: "Zoom", label: "Zoom" },
                      ]}
                      placeholder="Select contact method"
                      onChange={onChange}
                      defaultValue={value}
                    />
                  )}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Preferred Contact Time
                </label>
                <Controller
                  name="preferredContactTime"
                  control={control}
                  render={({ field }) => (
                    <Input {...field} type="time" />
                  )}
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
            Save
          </Button>
        </div>
      </form>
    </>
  );
}
