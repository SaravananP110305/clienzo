export interface SupportTicket {
  id: number;
  ticketNo: string;
  client: string;
  subject: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  assignee: string;
  date: string;
}

export const initialSupportTickets: SupportTicket[] = [
  { id: 1, ticketNo: "TK-4029", client: "Aventis Technologies", subject: "Unable to load dashboard reports inside safari mobile browser", priority: "High", status: "In Progress", assignee: "Emma Watson", date: "2026-07-12" },
  { id: 2, ticketNo: "TK-4028", client: "SpaceX Logistics", subject: "API webhooks payload signature mismatch on staging server", priority: "Critical", status: "Open", assignee: "Robert Lee", date: "2026-07-13" },
  { id: 3, ticketNo: "TK-4027", client: "Cyberdyne Systems", subject: "Requesting guidance on syncing employee list columns", priority: "Low", status: "Resolved", assignee: "John Doe", date: "2026-07-11" },
  { id: 4, ticketNo: "TK-4026", client: "Alphabet Web Services", subject: "Deployment webhook failed to trigger post build success", priority: "Medium", status: "Closed", assignee: "Alice Johnson", date: "2026-07-09" }
];
