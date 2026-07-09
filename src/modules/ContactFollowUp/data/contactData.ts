// Shared types and dummy data for Contact & Follow-up module

import { initialLeads } from "../../LeadManagement/data/leadsData";

export type ContactResult = "Interested" | "Call Later" | "Not Interested";

export interface FollowUp {
  id: number;
  leadId: number;
  company: string;
  contactPerson: string;
  phone: string;
  assignedTo: string;
  date: string;        // ISO date string
  time: string;        // HH:MM
  reason: string;
  status: "Scheduled" | "Completed" | "Missed";
}

// Leads assigned to "John Doe" (logged-in user simulation)
export const CURRENT_USER = "John Doe";

export const myLeads = initialLeads.filter(
  (l) => l.assignedTo === CURRENT_USER
);

export const FOLLOW_UP_REASONS = [
  "Pending decision",
  "Budget review",
  "Technical evaluation",
  "Stakeholder approval",
  "Proposal sent",
  "No response",
  "Requested callback",
];

export const NOT_INTERESTED_REASONS = [
  "Budget constraints",
  "Chose competitor",
  "No decision made",
  "Poor fit",
  "Timeline mismatch",
  "Not the right contact",
];

export const initialFollowUps: FollowUp[] = [
  {
    id: 1,
    leadId: 1,
    company: "Tech solutions",
    contactPerson: "Alice Smith",
    phone: "+1 234 567 890",
    assignedTo: "John Doe",
    date: "2026-07-10",
    time: "10:00",
    reason: "Pending decision",
    status: "Scheduled",
  },
  {
    id: 2,
    leadId: 3,
    company: "Apex digital",
    contactPerson: "Charlie Brown",
    phone: "+1 456 789 012",
    assignedTo: "John Doe",
    date: "2026-07-12",
    time: "14:30",
    reason: "Technical evaluation",
    status: "Scheduled",
  },
  {
    id: 3,
    leadId: 9,
    company: "Summit labs",
    contactPerson: "Ian Malcolm",
    phone: "+1 012 345 678",
    assignedTo: "John Doe",
    date: "2026-07-05",
    time: "11:00",
    reason: "Budget review",
    status: "Completed",
  },
  {
    id: 4,
    leadId: 6,
    company: "Alpha media",
    contactPerson: "Fiona Gallagher",
    phone: "+1 789 012 345",
    assignedTo: "John Doe",
    date: "2026-07-03",
    time: "09:00",
    reason: "No response",
    status: "Missed",
  },
  {
    id: 5,
    leadId: 1,
    company: "Tech solutions",
    contactPerson: "Alice Smith",
    phone: "+1 234 567 890",
    assignedTo: "John Doe",
    date: "2026-07-15",
    time: "15:00",
    reason: "Requested callback",
    status: "Scheduled",
  },
];

export const getFollowUpStatusColor = (
  status: FollowUp["status"]
): "success" | "warning" | "error" => {
  switch (status) {
    case "Scheduled":
      return "warning";
    case "Completed":
      return "success";
    case "Missed":
      return "error";
  }
};
