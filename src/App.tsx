import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
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

import {
  LEAD_SOURCES,
  INDUSTRIES,
  MEETING_TYPES,
  FOLLOWUP_REASONS,
  LOST_REASONS,
} from "./modules/Master/data/masterData";

// ────────────────────────────────────────────────────────────────────────────

export default function App() {
  const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);

  const handleDeleteMeeting = (id: number) => {
    setMeetings((prev) => prev.filter((m) => m.id !== id));
  };

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
            <Route path="/leads" element={<LeadList />} />
            <Route path="/leads/add" element={<AddLead />} />
            <Route path="/leads/:id/edit" element={<AddLead />} />
            <Route path="/leads/:id" element={<LeadDetails />} />
            <Route path="/contacts" element={<MyLeads />} />
            <Route path="/contacts/my-leads" element={<MyLeads />} />
            <Route path="/contacts/follow-ups" element={<FollowUps />} />
            <Route path="/contacts/:id" element={<ContactLeadDetail />} />

            <Route
              path="/meetings"
              element={
                <MeetingsScopePage
                  meetings={meetings}
                  onDeleteMeeting={handleDeleteMeeting}
                />
              }
            />
            <Route path="/meetings/add" element={<MeetingForm />} />
            <Route path="/meetings/:id/edit" element={<MeetingForm />} />
            <Route path="/meetings/:id" element={<MeetingDetails />} />

            {/* Reports Routes */}
            <Route path="/reports" element={<Navigate to="/reports/leads" replace />} />
            <Route path="/reports/leads" element={<LeadReport />} />
            <Route path="/reports/meetings" element={<MeetingReport />} />
            <Route path="/reports/employees" element={<EmployeeReport />} />
            <Route path="/reports/follow-ups" element={<FollowUpReport />} />

            {/* User Management Routes */}
            <Route path="/users" element={<UserManagement />} />
            <Route path="/roles" element={<UserRoleManagement />} />

            {/* Master Routes */}
            <Route
              path="/master/lead-sources"
              element={
                <MasterConfigPage
                  pageTitle="Lead sources"
                  itemNameSingular="lead source"
                  itemNamePlural="lead sources"
                  initialData={LEAD_SOURCES}
                />
              }
            />
            <Route
              path="/master/industries"
              element={
                <MasterConfigPage
                  pageTitle="Industries"
                  itemNameSingular="industry"
                  itemNamePlural="industries"
                  initialData={INDUSTRIES}
                />
              }
            />
            <Route
              path="/master/meeting-types"
              element={
                <MasterConfigPage
                  pageTitle="Meeting types"
                  itemNameSingular="meeting type"
                  itemNamePlural="meeting types"
                  initialData={MEETING_TYPES}
                />
              }
            />
            <Route
              path="/master/follow-up-reasons"
              element={
                <MasterConfigPage
                  pageTitle="Follow-up reasons"
                  itemNameSingular="follow-up reason"
                  itemNamePlural="follow-up reasons"
                  initialData={FOLLOWUP_REASONS}
                />
              }
            />
            <Route
              path="/master/lost-reasons"
              element={
                <MasterConfigPage
                  pageTitle="Lost reasons"
                  itemNameSingular="lost reason"
                  itemNamePlural="lost reasons"
                  initialData={LOST_REASONS}
                />
              }
            />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}
