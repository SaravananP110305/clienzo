import { MasterItem } from "../pages/MasterConfigPage";

// Extend MasterItem to include parent foreign key support
export interface MasterItemMapped extends MasterItem {
  countryId?: number;
  stateId?: number;
  departmentId?: number;
}

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

export const COUNTRIES: MasterItem[] = [
  { id: 1, name: "India", status: "Active" },
  { id: 2, name: "United States", status: "Active" },
  { id: 3, name: "United Kingdom", status: "Active" },
  { id: 4, name: "Canada", status: "Active" },
  { id: 5, name: "Australia", status: "Active" }
];

export const STATES: MasterItemMapped[] = [
  { id: 1, name: "Karnataka", countryId: 1, status: "Active" },
  { id: 2, name: "New York", countryId: 2, status: "Active" },
  { id: 3, name: "California", countryId: 2, status: "Active" },
  { id: 4, name: "Maharashtra", countryId: 1, status: "Active" },
  { id: 5, name: "Ontario", countryId: 4, status: "Active" }
];

export const CITIES: MasterItemMapped[] = [
  { id: 1, name: "Bangalore", stateId: 1, status: "Active" },
  { id: 2, name: "Mumbai", stateId: 4, status: "Active" },
  { id: 3, name: "New York City", stateId: 2, status: "Active" },
  { id: 4, name: "San Francisco", stateId: 3, status: "Active" },
  { id: 5, name: "Toronto", stateId: 5, status: "Active" }
];

export const DEPARTMENTS: MasterItem[] = [
  { id: 1, name: "Sales", status: "Active" },
  { id: 2, name: "Business Development", status: "Active" },
  { id: 3, name: "Engineering", status: "Active" },
  { id: 4, name: "Presales", status: "Active" },
  { id: 5, name: "Quality Assurance", status: "Active" },
  { id: 6, name: "DevOps", status: "Active" }
];

export const DESIGNATIONS: MasterItemMapped[] = [
  { id: 1, name: "CEO & Founder", departmentId: 1, status: "Active" },
  { id: 2, name: "BD Manager", departmentId: 2, status: "Active" },
  { id: 3, name: "BD Executive", departmentId: 2, status: "Active" },
  { id: 4, name: "Tech Lead", departmentId: 3, status: "Active" },
  { id: 5, name: "Senior Developer", departmentId: 3, status: "Active" },
  { id: 6, name: "QA Lead", departmentId: 5, status: "Active" },
  { id: 7, name: "DevOps Engineer", departmentId: 6, status: "Active" }
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

export const PRIORITIES: MasterItem[] = [
  { id: 1, name: "Critical", status: "Active" },
  { id: 2, name: "High", status: "Active" },
  { id: 3, name: "Medium", status: "Active" },
  { id: 4, name: "Low", status: "Active" }
];

export const PROJECT_CATEGORIES: MasterItem[] = [
  { id: 1, name: "ERP Software Development", status: "Active" },
  { id: 2, name: "Mobile App Development", status: "Active" },
  { id: 3, name: "Cloud Migration Service", status: "Active" },
  { id: 4, name: "QA & Testing Service", status: "Active" },
  { id: 5, name: "UI/UX Consultation", status: "Active" }
];

export const COMPANY_TYPES: MasterItem[] = [
  { id: 1, name: "Proprietorship", status: "Active" },
  { id: 2, name: "Partnership", status: "Active" },
  { id: 3, name: "Private Limited", status: "Active" },
  { id: 4, name: "Public Limited", status: "Active" },
  { id: 5, name: "LLP", status: "Active" }
];

export const PAYMENT_TYPES: MasterItem[] = [
  { id: 1, name: "Cash", status: "Active" },
  { id: 2, name: "Bank Transfer", status: "Active" },
  { id: 3, name: "Credit Card", status: "Active" },
  { id: 4, name: "UPI", status: "Active" },
  { id: 5, name: "Cheque", status: "Active" }
];

export const LEAD_STATUSES: MasterItem[] = [
  { id: 1, name: "New", status: "Active" },
  { id: 2, name: "Contacted", status: "Active" },
  { id: 3, name: "Qualified", status: "Active" },
  { id: 4, name: "Proposal Sent", status: "Active" },
  { id: 5, name: "Won", status: "Active" },
  { id: 6, name: "Lost", status: "Active" }
];

export const LOST_REASONS: MasterItem[] = [
  { id: 1, name: "Budget Constraints", status: "Active" },
  { id: 2, name: "Chose Competitor", status: "Active" },
  { id: 3, name: "No Decision Made", status: "Active" },
  { id: 4, name: "Poor Fit", status: "Active" },
  { id: 5, name: "Timeline Mismatch", status: "Active" },
  { id: 6, name: "Lost Contact", status: "Inactive" },
];
