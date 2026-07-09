import { useState } from "react";
import { useNavigate } from "react-router";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select";
import { useToast } from "../../../hooks/useToast";
import { LEAD_STATUSES, ASSIGNEES } from "../data/leadsData";

interface FormErrors {
  company?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  status?: string;
  assignedTo?: string;
}

export default function AddLead() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [company, setCompany] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [industry, setIndustry] = useState("");
  const [source, setSource] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!company.trim()) {
      newErrors.company = "Company name is required";
    } else if (company.trim().length < 2) {
      newErrors.company = "Company name must be at least 2 characters";
    }

    if (!contactPerson.trim()) {
      newErrors.contactPerson = "Contact person is required";
    } else if (contactPerson.trim().length < 3) {
      newErrors.contactPerson = "Contact person must be at least 3 characters";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = "Enter a valid email address";
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (phone.replace(/\D/g, "").length < 8) {
      newErrors.phone = "Phone must have at least 8 digits";
    }

    if (!status) {
      newErrors.status = "Status is required";
    }

    if (!assignedTo) {
      newErrors.assignedTo = "Assigned to is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) {
      showToast("Please fix the form errors before saving.", "error");
      return;
    }
    showToast("Lead added successfully.", "success");
    navigate("/leads");
  };

  const handleCancel = () => {
    navigate("/leads");
  };

  const fieldClass = (hasError: boolean) =>
    hasError ? "border-error-500 focus:ring-error-500/10" : "";

  return (
    <>
      <PageMeta
        title="Add Lead | ClienZo"
        description="Add a new lead to ClienZo CRM."
      />
      <PageBreadcrumb pageTitle="Add lead" />

      <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] p-6">
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
            <Input
              type="text"
              placeholder="Enter company name"
              value={company}
              onChange={(e) => {
                setCompany(e.target.value);
                if (errors.company) setErrors({ ...errors, company: undefined });
              }}
              className={fieldClass(!!errors.company)}
            />
            {errors.company && (
              <span className="mt-1.5 text-xs text-error-600 block">{errors.company}</span>
            )}
          </div>

          {/* Industry */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Industry
            </label>
            <Select
              options={[
                { value: "Information Technology", label: "Information Technology" },
                { value: "Healthcare", label: "Healthcare" },
                { value: "Finance", label: "Finance" },
                { value: "Manufacturing", label: "Manufacturing" },
                { value: "Retail", label: "Retail" },
                { value: "Education", label: "Education" },
              ]}
              placeholder="Select industry"
              onChange={(val) => setIndustry(val)}
              defaultValue={industry}
            />
          </div>

          {/* Website */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Website
            </label>
            <Input
              type="text"
              placeholder="https://example.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>

          {/* Source */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Lead source
            </label>
            <Select
              options={[
                { value: "Website", label: "Website" },
                { value: "Referral", label: "Referral" },
                { value: "Cold Call", label: "Cold Call" },
                { value: "LinkedIn", label: "LinkedIn" },
                { value: "Email Campaign", label: "Email Campaign" },
                { value: "Trade Show", label: "Trade Show" },
              ]}
              placeholder="Select source"
              onChange={(val) => setSource(val)}
              defaultValue={source}
            />
          </div>

          {/* Address */}
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Address
            </label>
            <Input
              type="text"
              placeholder="Enter full address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
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
            <Input
              type="text"
              placeholder="Enter contact person name"
              value={contactPerson}
              onChange={(e) => {
                setContactPerson(e.target.value);
                if (errors.contactPerson) setErrors({ ...errors, contactPerson: undefined });
              }}
              className={fieldClass(!!errors.contactPerson)}
            />
            {errors.contactPerson && (
              <span className="mt-1.5 text-xs text-error-600 block">{errors.contactPerson}</span>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email <span className="text-error-500">*</span>
            </label>
            <Input
              type="email"
              placeholder="contact@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              className={fieldClass(!!errors.email)}
            />
            {errors.email && (
              <span className="mt-1.5 text-xs text-error-600 block">{errors.email}</span>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone <span className="text-error-500">*</span>
            </label>
            <Input
              type="tel"
              placeholder="+1 234 567 890"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors.phone) setErrors({ ...errors, phone: undefined });
              }}
              className={fieldClass(!!errors.phone)}
            />
            {errors.phone && (
              <span className="mt-1.5 text-xs text-error-600 block">{errors.phone}</span>
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
            <Select
              options={LEAD_STATUSES.map((s) => ({ value: s, label: s }))}
              placeholder="Select status"
              onChange={(val) => {
                setStatus(val);
                if (errors.status) setErrors({ ...errors, status: undefined });
              }}
              defaultValue={status}
            />
            {errors.status && (
              <span className="mt-1.5 text-xs text-error-600 block">{errors.status}</span>
            )}
          </div>

          {/* Assigned To */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Assigned to <span className="text-error-500">*</span>
            </label>
            <Select
              options={ASSIGNEES.map((a) => ({ value: a, label: a }))}
              placeholder="Select assignee"
              onChange={(val) => {
                setAssignedTo(val);
                if (errors.assignedTo) setErrors({ ...errors, assignedTo: undefined });
              }}
              defaultValue={assignedTo}
            />
            {errors.assignedTo && (
              <span className="mt-1.5 text-xs text-error-600 block">{errors.assignedTo}</span>
            )}
          </div>

          {/* Notes */}
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Notes
            </label>
            <textarea
              placeholder="Add any relevant notes about this lead..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/[0.05]">
          <Button size="sm" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            Save lead
          </Button>
        </div>
      </div>
    </>
  );
}
