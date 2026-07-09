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
