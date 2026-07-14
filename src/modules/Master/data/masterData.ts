import { MasterItem } from "../pages/MasterConfigPage";

export const LEAD_SOURCES: MasterItem[] = [
  { id: 1, name: "Website", status: "Active" },
  { id: 2, name: "Referral", status: "Active" },
  { id: 3, name: "Cold Call", status: "Active" },
  { id: 4, name: "LinkedIn", status: "Active" },
  { id: 5, name: "Email Campaign", status: "Inactive" },
  { id: 6, name: "Trade Show", status: "Active" },
];

export const INDUSTRIES: MasterItem[] = [
  { id: 1, name: "Information Technology", status: "Active" },
  { id: 2, name: "Healthcare", status: "Active" },
  { id: 3, name: "Finance", status: "Active" },
  { id: 4, name: "Manufacturing", status: "Active" },
  { id: 5, name: "Retail", status: "Active" },
  { id: 6, name: "Education", status: "Inactive" },
];

export const MEETING_TYPES: MasterItem[] = [
  { id: 1, name: "Discovery Call", status: "Active" },
  { id: 2, name: "Product Demo", status: "Active" },
  { id: 3, name: "Proposal Review", status: "Active" },
  { id: 4, name: "Negotiation", status: "Active" },
  { id: 5, name: "Onboarding", status: "Active" },
  { id: 6, name: "Follow-up Call", status: "Inactive" },
];

export const FOLLOWUP_REASONS: MasterItem[] = [
  { id: 1, name: "Pending Decision", status: "Active" },
  { id: 2, name: "Budget Review", status: "Active" },
  { id: 3, name: "Technical Evaluation", status: "Active" },
  { id: 4, name: "Stakeholder Approval", status: "Active" },
  { id: 5, name: "Proposal Sent", status: "Active" },
  { id: 6, name: "No Response", status: "Inactive" },
];

export const LOST_REASONS: MasterItem[] = [
  { id: 1, name: "Budget Constraints", status: "Active" },
  { id: 2, name: "Chose Competitor", status: "Active" },
  { id: 3, name: "No Decision Made", status: "Active" },
  { id: 4, name: "Poor Fit", status: "Active" },
  { id: 5, name: "Timeline Mismatch", status: "Active" },
  { id: 6, name: "Lost Contact", status: "Inactive" },
];

export const COUNTRIES: MasterItem[] = [
  { id: 1, name: "India", status: "Active" },
  { id: 2, name: "United States", status: "Active" },
  { id: 3, name: "United Kingdom", status: "Active" },
  { id: 4, name: "Canada", status: "Active" },
  { id: 5, name: "Australia", status: "Active" }
];

export const STATES: MasterItem[] = [
  { id: 1, name: "Karnataka", status: "Active" },
  { id: 2, name: "New York", status: "Active" },
  { id: 3, name: "California", status: "Active" },
  { id: 4, name: "Maharashtra", status: "Active" },
  { id: 5, name: "Ontario", status: "Active" }
];

export const CITIES: MasterItem[] = [
  { id: 1, name: "Bangalore", status: "Active" },
  { id: 2, name: "Mumbai", status: "Active" },
  { id: 3, name: "New York City", status: "Active" },
  { id: 4, name: "San Francisco", status: "Active" },
  { id: 5, name: "Toronto", status: "Active" }
];

export const DEPARTMENTS: MasterItem[] = [
  { id: 1, name: "Sales", status: "Active" },
  { id: 2, name: "Business Development", status: "Active" },
  { id: 3, name: "Engineering", status: "Active" },
  { id: 4, name: "Presales", status: "Active" },
  { id: 5, name: "Quality Assurance", status: "Active" },
  { id: 6, name: "DevOps", status: "Active" }
];

export const DESIGNATIONS: MasterItem[] = [
  { id: 1, name: "CEO & Founder", status: "Active" },
  { id: 2, name: "BD Manager", status: "Active" },
  { id: 3, name: "BD Executive", status: "Active" },
  { id: 4, name: "Tech Lead", status: "Active" },
  { id: 5, name: "Senior Developer", status: "Active" },
  { id: 6, name: "QA Lead", status: "Active" },
  { id: 7, name: "DevOps Engineer", status: "Active" }
];

export const TECHNOLOGIES: MasterItem[] = [
  { id: 1, name: "React.js", status: "Active" },
  { id: 2, name: "Node.js", status: "Active" },
  { id: 3, name: "TypeScript", status: "Active" },
  { id: 4, name: "Python", status: "Active" },
  { id: 5, name: "PostgreSQL", status: "Active" },
  { id: 6, name: "AWS Cloud", status: "Active" },
  { id: 7, name: "Docker & K8s", status: "Active" }
];

export const LEAD_STATUSES: MasterItem[] = [
  { id: 1, name: "New", status: "Active" },
  { id: 2, name: "Contacted", status: "Active" },
  { id: 3, name: "Qualified", status: "Active" },
  { id: 4, name: "Proposal Sent", status: "Active" },
  { id: 5, name: "Won", status: "Active" },
  { id: 6, name: "Lost", status: "Active" }
];

export const PRIORITIES: MasterItem[] = [
  { id: 1, name: "Critical", status: "Active" },
  { id: 2, name: "High", status: "Active" },
  { id: 3, name: "Medium", status: "Active" },
  { id: 4, name: "Low", status: "Active" }
];

export const FOLLOWUP_TYPES: MasterItem[] = [
  { id: 1, name: "Email Outreach", status: "Active" },
  { id: 2, name: "Phone Call", status: "Active" },
  { id: 3, name: "Video Meeting", status: "Active" },
  { id: 4, name: "In-Person Meeting", status: "Active" },
  { id: 5, name: "WhatsApp Chat", status: "Active" }
];

export const PROJECT_CATEGORIES: MasterItem[] = [
  { id: 1, name: "ERP Software Development", status: "Active" },
  { id: 2, name: "Mobile App Development", status: "Active" },
  { id: 3, name: "Cloud Migration Service", status: "Active" },
  { id: 4, name: "QA & Testing Service", status: "Active" },
  { id: 5, name: "UI/UX Consultation", status: "Active" }
];

export const PROJECT_STATUSES: MasterItem[] = [
  { id: 1, name: "Planning", status: "Active" },
  { id: 2, name: "In Progress", status: "Active" },
  { id: 3, name: "On Hold", status: "Active" },
  { id: 4, name: "Completed", status: "Active" }
];
