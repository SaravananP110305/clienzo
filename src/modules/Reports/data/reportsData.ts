export interface LeadReportData {
  id: number;
  company: string;
  contactPerson: string;
  email: string;
  phone: string;
  source: string;
  industry: string;
  status: string;
  assignedTo: string;
}

export interface MeetingReportData {
  id: number;
  subject: string;
  company: string;
  contactPerson: string;
  date: string;
  time: string;
  type: string;
  status: string;
}

export interface EmployeeReportData {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: "Active" | "Inactive";
  totalLeads: number;
  wonLeads: number;
  lostLeads: number;
}

export interface FollowUpReportData {
  id: number;
  company: string;
  contactPerson: string;
  date: string;
  time: string;
  reason: string;
  status: string;
  outcome: string;
}

export const LEAD_REPORT_DATA: LeadReportData[] = [
  { id: 1, company: "Tech solutions", contactPerson: "Alice Smith", email: "alice@techsolutions.com", phone: "+91 98765 43210", source: "Website", industry: "Information Technology", status: "New", assignedTo: "John Doe" },
  { id: 2, company: "Innovate LLC", contactPerson: "Bob Jones", email: "bob@innovatellc.com", phone: "+91 98765 43211", source: "Referral", industry: "Finance", status: "Contacted", assignedTo: "Jane Smith" },
  { id: 3, company: "Apex digital", contactPerson: "Charlie Brown", email: "charlie@apexdigital.com", phone: "+91 98765 43212", source: "LinkedIn", industry: "Healthcare", status: "Qualified", assignedTo: "John Doe" },
  { id: 4, company: "Nextgen software", contactPerson: "Diana Prince", email: "diana@nextgensoftware.com", phone: "+91 98765 43213", source: "Cold Call", industry: "Manufacturing", status: "Proposal sent", assignedTo: "Alice Johnson" },
  { id: 5, company: "Quantum systems", contactPerson: "Evan Wright", email: "evan@quantumsystems.com", phone: "+91 98765 43214", source: "Trade Show", industry: "Information Technology", status: "Won", assignedTo: "Jane Smith" },
  { id: 6, company: "Alpha media", contactPerson: "Fiona Gallagher", email: "fiona@alphamedia.com", phone: "+91 98765 43215", source: "Email Campaign", industry: "Retail", status: "Lost", assignedTo: "John Doe" },
];

export const MEETING_REPORT_DATA: MeetingReportData[] = [
  { id: 1, subject: "Discovery Call & Product Intro", company: "Tech solutions", contactPerson: "Alice Smith", date: "2026-07-09", time: "10:30", type: "Google Meet", status: "Scheduled" },
  { id: 2, subject: "Pricing & License Discussion", company: "Innovate LLC", contactPerson: "Bob Jones", date: "2026-07-09", time: "14:00", type: "Google Meet", status: "Rescheduled" },
  { id: 3, subject: "Detailed Technical Demo", company: "Apex digital", contactPerson: "Charlie Brown", date: "2026-07-10", time: "11:00", type: "Google Meet", status: "Scheduled" },
  { id: 4, subject: "On-site Contract Negotiation", company: "Quantum systems", contactPerson: "Evan Wright", date: "2026-07-15", time: "15:30", type: "Offline", status: "Scheduled" },
  { id: 5, subject: "Initial Discovery Call", company: "Summit labs", contactPerson: "Ian Malcolm", date: "2026-07-05", time: "09:30", type: "Google Meet", status: "Completed" },
];

export const EMPLOYEE_REPORT_DATA: EmployeeReportData[] = [
  { id: 1, name: "John Doe", email: "john.doe@saiflow.com", phone: "+91 98765 43210", role: "Administrator", status: "Active", totalLeads: 12, wonLeads: 4, lostLeads: 2 },
  { id: 2, name: "Jane Smith", email: "jane.smith@saiflow.com", phone: "+91 98765 43211", role: "Business Development Manager", status: "Active", totalLeads: 15, wonLeads: 6, lostLeads: 3 },
  { id: 3, name: "Alice Johnson", email: "alice.johnson@saiflow.com", phone: "+91 98765 43212", role: "Business Development Executive", status: "Active", totalLeads: 8, wonLeads: 2, lostLeads: 1 },
  { id: 4, name: "Robert Lee", email: "robert.lee@saiflow.com", phone: "+91 98765 43213", role: "Presales Consultant", status: "Active", totalLeads: 4, wonLeads: 1, lostLeads: 0 },
  { id: 5, name: "Emma Watson", email: "emma.watson@saiflow.com", phone: "+91 98765 43214", role: "Guest User", status: "Inactive", totalLeads: 0, wonLeads: 0, lostLeads: 0 }
];

export const FOLLOW_UP_REPORT_DATA: FollowUpReportData[] = [
  { id: 1, company: "Tech solutions", contactPerson: "Alice Smith", date: "2026-07-09", time: "10:00", reason: "Pending decision", status: "Scheduled", outcome: "Awaiting decision maker callback" },
  { id: 2, company: "Apex digital", contactPerson: "Charlie Brown", date: "2026-07-12", time: "14:30", reason: "Technical evaluation", status: "Scheduled", outcome: "Demo environment prepared" },
  { id: 3, company: "Summit labs", contactPerson: "Ian Malcolm", date: "2026-07-05", time: "11:00", reason: "Budget review", status: "Completed", outcome: "Budget confirmed, proceed to proposal" },
  { id: 4, company: "Alpha media", contactPerson: "Fiona Gallagher", date: "2026-07-03", time: "09:00", reason: "No response", status: "Missed", outcome: "Voicemail left" }
];
