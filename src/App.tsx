import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import ForgotPassword from "./pages/AuthPages/ForgotPassword";
import ResetPassword from "./pages/AuthPages/ResetPassword";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import ChangePassword from "./pages/ChangePassword";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Dashboard from "./modules/Dashboard/pages/Dashboard";
import UserManagement from "./modules/UserManagement/pages/UserManagement";
import UserRoleManagement from "./modules/UserManagement/pages/UserRoleManagement";
import MasterConfigPage from "./modules/Master/pages/MasterConfigPage";
import LeadList from "./modules/LeadManagement/pages/LeadList";
import AddLead from "./modules/LeadManagement/pages/AddLead";
import LeadDetails from "./modules/LeadManagement/pages/LeadDetails";
import MyLeads from "./modules/ContactFollowUp/pages/MyLeads";
import FollowUps from "./modules/ContactFollowUp/pages/FollowUps";
import ContactLeadDetail from "./modules/ContactFollowUp/pages/ContactLeadDetail";
import { Meeting, initialMeetings } from "./modules/MeetingManagement/data/meetingsData";
import MeetingsScopePage from "./modules/MeetingManagement/pages/MeetingsScopePage";
import MeetingForm from "./modules/MeetingManagement/pages/MeetingForm";
import MeetingDetails from "./modules/MeetingManagement/pages/MeetingDetails";
import LeadReport from "./modules/Reports/pages/LeadReport";
import MeetingReport from "./modules/Reports/pages/MeetingReport";
import EmployeeReport from "./modules/Reports/pages/EmployeeReport";
import FollowUpReport from "./modules/Reports/pages/FollowUpReport";
import { ToastProvider } from "./context/ToastContext";
import { getStorage, setStorage } from "./utils/storage";

import {
  LEAD_SOURCES,
  INDUSTRIES,
  MEETING_TYPES,
  FOLLOWUP_REASONS,
  LOST_REASONS,
} from "./modules/Master/data/masterData";

// ────────────────────────────────────────────────────────────────────────────

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const loggedInUser = getStorage<any>("clienzo_logged_in_user", null);
  if (!loggedInUser) {
    return <Navigate to="/signin" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(loggedInUser.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const [meetings, setMeetings] = useState<Meeting[]>(() => getStorage("clienzo_meetings", initialMeetings));

  const handleDeleteMeeting = (id: number) => {
    const updated = meetings.filter((m) => m.id !== id);
    setMeetings(updated);
    setStorage("clienzo_meetings", updated);
  };

  const handleUpdateMeetingStatus = (id: number, status: Meeting["status"]) => {
    const updated = meetings.map((m) => m.id === id ? { ...m, status } : m);
    setMeetings(updated);
    setStorage("clienzo_meetings", updated);
  };

  const handleSaveMeeting = (meeting: Meeting, isEdit: boolean) => {
    let updated: Meeting[];
    if (isEdit) {
      updated = meetings.map((m) => m.id === meeting.id ? meeting : m);
    } else {
      updated = [...meetings, meeting];
    }
    setMeetings(updated);
    setStorage("clienzo_meetings", updated);
  };

  const bdeRoles = ["Business Development Manager", "Business Development Executive", "Presales Consultant"];
  const allowedRoles = ["Administrator", ...bdeRoles];

  return (
    <ToastProvider>
      <Router basename="/clienzo">
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Dashboard />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/change-password" element={<ChangePassword />} />

            {/* Clienzo Feature Module Route Placeholders */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/leads"
              element={
                <ProtectedRoute allowedRoles={allowedRoles}>
                  <LeadList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leads/add"
              element={
                <ProtectedRoute allowedRoles={allowedRoles}>
                  <AddLead />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leads/:id/edit"
              element={
                <ProtectedRoute allowedRoles={allowedRoles}>
                  <AddLead />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leads/:id"
              element={
                <ProtectedRoute allowedRoles={allowedRoles}>
                  <LeadDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contacts"
              element={
                <ProtectedRoute allowedRoles={allowedRoles}>
                  <MyLeads />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contacts/my-leads"
              element={
                <ProtectedRoute allowedRoles={allowedRoles}>
                  <MyLeads />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contacts/follow-ups"
              element={
                <ProtectedRoute allowedRoles={allowedRoles}>
                  <FollowUps />
                </ProtectedRoute>
              }
            />
            <Route
              path="/contacts/:id"
              element={
                <ProtectedRoute allowedRoles={allowedRoles}>
                  <ContactLeadDetail />
                </ProtectedRoute>
              }
            />

            <Route
              path="/meetings"
              element={
                <ProtectedRoute allowedRoles={allowedRoles}>
                  <MeetingsScopePage
                    meetings={meetings}
                    onDeleteMeeting={handleDeleteMeeting}
                    onUpdateMeetingStatus={handleUpdateMeetingStatus}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/meetings/add"
              element={
                <ProtectedRoute allowedRoles={allowedRoles}>
                  <MeetingForm onSave={handleSaveMeeting} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/meetings/:id/edit"
              element={
                <ProtectedRoute allowedRoles={allowedRoles}>
                  <MeetingForm onSave={handleSaveMeeting} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/meetings/:id"
              element={
                <ProtectedRoute allowedRoles={allowedRoles}>
                  <MeetingDetails />
                </ProtectedRoute>
              }
            />

            {/* Reports Routes */}
            <Route path="/reports" element={<Navigate to="/reports/leads" replace />} />
            <Route
              path="/reports/leads"
              element={
                <ProtectedRoute allowedRoles={["Administrator"]}>
                  <LeadReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/meetings"
              element={
                <ProtectedRoute allowedRoles={["Administrator"]}>
                  <MeetingReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/employees"
              element={
                <ProtectedRoute allowedRoles={["Administrator"]}>
                  <EmployeeReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/follow-ups"
              element={
                <ProtectedRoute allowedRoles={["Administrator"]}>
                  <FollowUpReport />
                </ProtectedRoute>
              }
            />

            {/* Manage Users Routes */}
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={["Administrator"]}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/roles"
              element={
                <ProtectedRoute allowedRoles={["Administrator"]}>
                  <UserRoleManagement />
                </ProtectedRoute>
              }
            />

            {/* Master Routes */}
            <Route
              path="/master/lead-sources"
              element={
                <ProtectedRoute allowedRoles={["Administrator"]}>
                  <MasterConfigPage
                    pageTitle="Lead sources"
                    itemNameSingular="lead source"
                    itemNamePlural="lead sources"
                    initialData={LEAD_SOURCES}
                    storageKey="clienzo_master_lead_sources"
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/master/industries"
              element={
                <ProtectedRoute allowedRoles={["Administrator"]}>
                  <MasterConfigPage
                    pageTitle="Industries"
                    itemNameSingular="industry"
                    itemNamePlural="industries"
                    initialData={INDUSTRIES}
                    storageKey="clienzo_master_industries"
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/master/meeting-types"
              element={
                <ProtectedRoute allowedRoles={["Administrator"]}>
                  <MasterConfigPage
                    pageTitle="Meeting types"
                    itemNameSingular="meeting type"
                    itemNamePlural="meeting types"
                    initialData={MEETING_TYPES}
                    storageKey="clienzo_master_meeting_types"
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/master/follow-up-reasons"
              element={
                <ProtectedRoute allowedRoles={["Administrator"]}>
                  <MasterConfigPage
                    pageTitle="Follow-up reasons"
                    itemNameSingular="follow-up reason"
                    itemNamePlural="follow-up reasons"
                    initialData={FOLLOWUP_REASONS}
                    storageKey="clienzo_master_followup_reasons"
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/master/lost-reasons"
              element={
                <ProtectedRoute allowedRoles={["Administrator"]}>
                  <MasterConfigPage
                    pageTitle="Lost reasons"
                    itemNameSingular="lost reason"
                    itemNamePlural="lost reasons"
                    initialData={LOST_REASONS}
                    storageKey="clienzo_master_lost_reasons"
                  />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}
