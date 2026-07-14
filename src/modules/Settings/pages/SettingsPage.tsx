import { useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import Input from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select";
import { useToast } from "../../../hooks/useToast";

export default function SettingsPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"general" | "company" | "security">("general");

  // General Settings States
  const [appName, setAppName] = useState("SaiFlow ERP");
  const [timeZone, setTimeZone] = useState("GMT+05:30");
  const [language, setLanguage] = useState("English (US)");

  // Company Details States
  const [companyName, setCompanyName] = useState("Sai Technologies");
  const [contactEmail, setContactEmail] = useState("info@saiflow.com");
  const [address, setAddress] = useState("12, Tech Park Avenue, Bangalore, India");

  // Security/Password States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("General system settings saved.", "success");
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Company profile details updated.", "success");
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast("All password fields are required.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("New passwords do not match.", "error");
      return;
    }
    showToast("Password updated successfully.", "success");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Current Password *</label>
              <Input type="password" placeholder="••••••••" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">New Password *</label>
              <Input type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Confirm New Password *</label>
              <Input type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
            <div className="flex justify-between items-center pt-6 border-t border-gray-100 dark:border-gray-800">
              <div>
                <h4 className="text-sm font-semibold text-error-600">Database Wipe (Danger Zone)</h4>
                <p className="text-xs text-gray-500">Resetting local storage cleans up all mock data configurations.</p>
              </div>
              <Button type="button" onClick={handleResetDatabase} className="bg-error-50 text-error-600 border-error-100 hover:bg-error-100 dark:bg-error-500/10 dark:text-error-500" size="sm">
                Reset App Data
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
