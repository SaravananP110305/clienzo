export interface QaTicket {
  id: number;
  bugNo: string;
  title: string;
  project: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  status: "Open" | "In Progress" | "Retesting" | "Closed";
  assignee: string;
  reportedBy: string;
  date: string;
}

export const initialQaTickets: QaTicket[] = [
  { id: 1, bugNo: "BUG-001", title: "Theme toggler fails on initial local storage load", project: "SaiFlow ERP Phase 1", priority: "High", status: "In Progress", assignee: "John Doe", reportedBy: "Jane Smith", date: "2026-07-10" },
  { id: 2, bugNo: "BUG-002", title: "Null pointer exception on client creation without description", project: "Cargo Tracking System", priority: "Critical", status: "Open", assignee: "Robert Lee", reportedBy: "Emma Watson", date: "2026-07-11" },
  { id: 3, bugNo: "BUG-003", title: "Responsive sidebar overlapping on mobile Safari browser", project: "SaiFlow ERP Phase 1", priority: "Medium", status: "Retesting", assignee: "Emma Watson", reportedBy: "Alice Johnson", date: "2026-07-12" },
  { id: 4, bugNo: "BUG-004", title: "Profile settings avatar file size limit warning doesn't trigger", project: "Customer Portal Redesign", priority: "Low", status: "Closed", assignee: "Alice Johnson", reportedBy: "John Doe", date: "2026-07-12" }
];
