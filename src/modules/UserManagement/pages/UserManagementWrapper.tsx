import { useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import UserManagement from "./UserManagement";
import UserRoleManagement from "./UserRoleManagement";

export default function UserManagementWrapper() {
  const [activeTab, setActiveTab] = useState<"users" | "roles">("users");

  return (
    <>
      <PageMeta
        title={`${activeTab === "users" ? "Manage Users" : "User Role Management"} | ClienZo`}
        description="Manage users and roles in ClienZo CRM."
      />
      {/* Page Title & Breadcrumb */}
      <PageBreadcrumb pageTitle={activeTab === "users" ? "Manage Users" : "User Role Management"} />

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 mb-6">
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-3 text-sm font-semibold border-b-2 px-4 cursor-pointer transition-colors ${activeTab === "users"
              ? "border-brand-500 text-brand-500 font-semibold"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-250"
            }`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab("roles")}
          className={`pb-3 text-sm font-semibold border-b-2 px-4 cursor-pointer transition-colors ${activeTab === "roles"
              ? "border-brand-500 text-brand-500 font-semibold"
              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-205"
            }`}
        >
          Roles
        </button>
      </div>

      {/* Render Selected Component */}
      {activeTab === "users" ? <UserManagement /> : <UserRoleManagement />}
    </>
  );
}
