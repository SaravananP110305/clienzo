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
import MasterConfigPage, { MasterItem } from "./modules/Master/pages/MasterConfigPage";
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

// ── Master dummy datasets ────────────────────────────────────────────────────

const LEAD_SOURCES: MasterItem[] = [
  { id: 1, name: "Website", description: "Leads coming from the company website", status: "Active" },
  { id: 2, name: "Referral", description: "Leads referred by existing clients", status: "Active" },
  { id: 3, name: "Cold Call", description: "Outbound cold calling campaigns", status: "Active" },
  { id: 4, name: "LinkedIn", description: "Leads sourced via LinkedIn outreach", status: "Active" },
  { id: 5, name: "Email Campaign", description: "Marketing email campaigns", status: "Inactive" },
  { id: 6, name: "Trade Show", description: "Leads collected at trade shows and events", status: "Active" },
];

const INDUSTRIES: MasterItem[] = [
  { id: 1, name: "Information Technology", description: "Software, hardware, and IT services", status: "Active" },
  { id: 2, name: "Healthcare", description: "Hospitals, clinics, and healthcare providers", status: "Active" },
  { id: 3, name: "Finance", description: "Banking, insurance, and financial services", status: "Active" },
  { id: 4, name: "Manufacturing", description: "Product manufacturing and supply chain", status: "Active" },
  { id: 5, name: "Retail", description: "Consumer goods and retail businesses", status: "Active" },
  { id: 6, name: "Education", description: "Schools, universities, and e-learning", status: "Inactive" },
];

const MEETING_TYPES: MasterItem[] = [
  { id: 1, name: "Discovery Call", description: "Initial call to understand client needs", status: "Active" },
  { id: 2, name: "Product Demo", description: "Live demonstration of product features", status: "Active" },
  { id: 3, name: "Proposal Review", description: "Review and discuss the submitted proposal", status: "Active" },
  { id: 4, name: "Negotiation", description: "Contract and pricing negotiation session", status: "Active" },
  { id: 5, name: "Onboarding", description: "Client onboarding and account setup meeting", status: "Active" },
  { id: 6, name: "Follow-up Call", description: "Post-meeting follow-up discussion", status: "Inactive" },
];

const FOLLOWUP_REASONS: MasterItem[] = [
  { id: 1, name: "Pending Decision", description: "Client is evaluating options before deciding", status: "Active" },
  { id: 2, name: "Budget Review", description: "Client needs to review internal budget", status: "Active" },
  { id: 3, name: "Technical Evaluation", description: "Technical team is evaluating the solution", status: "Active" },
  { id: 4, name: "Stakeholder Approval", description: "Awaiting approval from key stakeholders", status: "Active" },
  { id: 5, name: "Proposal Sent", description: "Waiting for client response after proposal", status: "Active" },
  { id: 6, name: "No Response", description: "Client not responding to outreach attempts", status: "Inactive" },
];

const LOST_REASONS: MasterItem[] = [
  { id: 1, name: "Budget Constraints", description: "Client did not have adequate budget", status: "Active" },
  { id: 2, name: "Chose Competitor", description: "Client selected a competing product/vendor", status: "Active" },
  { id: 3, name: "No Decision Made", description: "Client decided not to move forward", status: "Active" },
  { id: 4, name: "Poor Fit", description: "Product did not match client requirements", status: "Active" },
  { id: 5, name: "Timeline Mismatch", description: "Client timeline did not align with delivery", status: "Active" },
  { id: 6, name: "Lost Contact", description: "Client became unresponsive and unreachable", status: "Inactive" },
];

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
            <Route path="/leads/:id" element={<LeadDetails />} />
            <Route path="/contacts" element={<MyLeads />} />
            <Route path="/contacts/my-leads" element={<MyLeads />} />
            <Route path="/contacts/follow-ups" element={<FollowUps />} />
            <Route path="/contacts/:id" element={<ContactLeadDetail />} />

            {/* Meetings Routes */}
            <Route path="/meetings" element={<Navigate to="/meetings/upcoming" replace />} />
            <Route
              path="/meetings/upcoming"
              element={
                <MeetingsScopePage
                  scope="upcoming"
                  pageTitle="Upcoming meetings"
                  meetings={meetings}
                  onDeleteMeeting={handleDeleteMeeting}
                />
              }
            />
            <Route
              path="/meetings/today"
              element={
                <MeetingsScopePage
                  scope="today"
                  pageTitle="Today's meetings"
                  meetings={meetings}
                  onDeleteMeeting={handleDeleteMeeting}
                />
              }
            />
            <Route
              path="/meetings/completed"
              element={
                <MeetingsScopePage
                  scope="completed"
                  pageTitle="Completed meetings"
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
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}
