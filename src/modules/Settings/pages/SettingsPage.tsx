import { useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select";
import { useToast } from "../../../hooks/useToast";
import { getStorage, setStorage } from "../../../utils/storage";

interface PasswordErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

interface Settings {
  appName: string;
  timeZone: string;
  language: string;
  companyName: string;
  contactEmail: string;
  address: string;
}

const DEFAULT_SETTINGS: Settings = {
  appName: "SaiFlow ERP",
  timeZone: "GMT+05:30",
  language: "English (US)",
  companyName: "Sai Technologies",
  contactEmail: "info@saiflow.com",
  address: "12, Tech Park Avenue, Bangalore, India",
};

export default function SettingsPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"general" | "company" | "security">("general");

  const saved = getStorage<Settings>("saiflow_settings", DEFAULT_SETTINGS);

  // General Settings States
  const [appName, setAppName] = useState(saved.appName);
  const [timeZone, setTimeZone] = useState(saved.timeZone);
  const [language, setLanguage] = useState(saved.language);

  // Company Details States
  const [companyName, setCompanyName] = useState(saved.companyName);
  const [contactEmail, setContactEmail] = useState(saved.contactEmail);
  const [address, setAddress] = useState(saved.address);

  // Security/Password States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({});

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    const current = getStorage<Settings>("saiflow_settings", DEFAULT_SETTINGS);
    setStorage("saiflow_settings", {
      ...current,
      appName,
      timeZone,
      language,
    });
    showToast("General system settings saved.", "success");
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    const current = getStorage<Settings>("saiflow_settings", DEFAULT_SETTINGS);
    setStorage("saiflow_settings", {
      ...current,
      companyName,
      contactEmail,
      address,
    });
    showToast("Company profile details updated.", "success");
  };

  const validatePasswordField = (field: string, value: string): string | null => {
    switch (field) {
      case "currentPassword":
        if (!value.trim()) return "Current password is required.";
        break;
      case "newPassword":
        if (!value.trim()) return "New password is required.";
        if (value.length < 6) return "Password must be at least 6 characters.";
        break;
      case "confirmPassword":
        if (!value.trim()) return "Please confirm your new password.";
        if (value !== newPassword) return "Passwords do not match.";
        break;
    }
    return null;
  };

  const handlePasswordBlur = (field: string, value: string) => {
    const err = validatePasswordField(field, value);
    setPasswordErrors((prev) => {
      const next = { ...prev };
      if (err) (next as any)[field] = err;
      else delete (next as any)[field];
      return next;
    });
  };

  const handlePasswordChange = (field: string, value: string, setter: (v: string) => void, clearField?: string) => {
    setter(value);
    // Clear error when user types
    if (passwordErrors[field as keyof PasswordErrors]) {
      setPasswordErrors((prev) => {
        const next = { ...prev };
        delete next[field as keyof PasswordErrors];
        return next;
      });
    }
    // Clear confirm password error when new password changes
    if (clearField && passwordErrors[clearField as keyof PasswordErrors]) {
      setPasswordErrors((prev) => {
        const next = { ...prev };
        delete next[clearField as keyof PasswordErrors];
        return next;
      });
    }
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: PasswordErrors = {};
    
    const curErr = validatePasswordField("currentPassword", currentPassword);
    if (curErr) newErrors.currentPassword = curErr;
    
    const newErr = validatePasswordField("newPassword", newPassword);
    if (newErr) newErrors.newPassword = newErr;
    
    const confErr = validatePasswordField("confirmPassword", confirmPassword);
    if (confErr) newErrors.confirmPassword = confErr;

    if (Object.keys(newErrors).length > 0) {
      setPasswordErrors(newErrors);
      showToast("Please fix the form errors before submitting.", "error");
      return;
    }
    
    showToast("Password updated successfully.", "success");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordErrors({});
  };

  const handleResetDatabase = () => {
    localStorage.clear();
    showToast("Local Storage data wiped. Reloading application...", "info");
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  return (
    <>
      <PageMeta
        title="System Settings | SaiFlow"
        description="Configure application defaults, company metadata, and database controls in SaiFlow ERP."
      />
      <PageBreadcrumb pageTitle="Settings" />

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 mb-6">
        <button
          onClick={() => setActiveTab("general")}
          className={`pb-3 text-sm font-semibold border-b-2 px-4 cursor-pointer transition-colors ${activeTab === "general"
            ? "border-brand-500 text-brand-500 font-semibold"
            : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
        >
          General Settings
        </button>
        <button
          onClick={() => setActiveTab("company")}
          className={`pb-3 text-sm font-semibold border-b-2 px-4 cursor-pointer transition-colors ${activeTab === "company"
            ? "border-brand-500 text-brand-500 font-semibold"
            : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
        >
          Company Details
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`pb-3 text-sm font-semibold border-b-2 px-4 cursor-pointer transition-colors ${activeTab === "security"
            ? "border-brand-500 text-brand-500 font-semibold"
            : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
        >
          Security & Password
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] max-w-2xl">
        {activeTab === "general" && (
          <form onSubmit={handleSaveGeneral} className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">General Configuration</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Application Name</label>
              <Input type="text" value={appName} onChange={(e) => setAppName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">System Timezone</label>
              <Select
                options={[
                  { value: "GMT+05:30", label: "GMT+05:30 (India Standard Time)" },
                  { value: "GMT+00:00", label: "GMT+00:00 (UTC)" },
                  { value: "GMT-05:00", label: "GMT-05:00 (Eastern Standard Time)" },
                ]}
                defaultValue={timeZone}
                onChange={setTimeZone}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Default Language</label>
              <Select
                options={[
                  { value: "English (US)", label: "English (US)" },
                  { value: "English (UK)", label: "English (UK)" },
                  { value: "Spanish", label: "Spanish" },
                ]}
                defaultValue={language}
                onChange={setLanguage}
              />
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" variant="primary" size="sm">Save Settings</Button>
            </div>
          </form>
        )}

        {activeTab === "company" && (
          <form onSubmit={handleSaveCompany} className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Company Profile Details</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Company Registered Name</label>
              <Input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Contact Email Address</label>
              <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Corporate Address</label>
              <Input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" variant="primary" size="sm">Save Profile</Button>
            </div>
          </form>
        )}

        {activeTab === "security" && (
          <form onSubmit={handleSaveSecurity} className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">Security & Credentials</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                Current Password <span className="text-error-500">*</span>
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => handlePasswordChange("currentPassword", e.target.value, setCurrentPassword)}
                onBlur={() => handlePasswordBlur("currentPassword", currentPassword)}
                error={!!passwordErrors.currentPassword}
                hint={passwordErrors.currentPassword}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                New Password <span className="text-error-500">*</span>
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => handlePasswordChange("newPassword", e.target.value, setNewPassword, "confirmPassword")}
                onBlur={() => handlePasswordBlur("newPassword", newPassword)}
                error={!!passwordErrors.newPassword}
                hint={passwordErrors.newPassword}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">
                Confirm New Password <span className="text-error-500">*</span>
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => handlePasswordChange("confirmPassword", e.target.value, setConfirmPassword)}
                onBlur={() => handlePasswordBlur("confirmPassword", confirmPassword)}
                error={!!passwordErrors.confirmPassword}
                hint={passwordErrors.confirmPassword}
              />
            </div>
            <div className="flex justify-between items-center pt-6 border-t border-gray-100 dark:border-gray-800">
              <div>
                <h4 className="text-sm font-semibold text-error-600">Demo Data Reset (Danger Zone)</h4>
                <p className="text-xs text-gray-500">Resetting local storage cleans up all mock data configurations.</p>
              </div>
              <Button type="button" onClick={handleResetDatabase} className="bg-error-50 text-error-600 border-error-100 hover:bg-error-100 dark:bg-error-500/10 dark:text-error-500" size="sm">
                Reset Demo Data
              </Button>
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" variant="primary" size="sm">Update Password</Button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
