export interface Task {
  id: number;
  title: string;
  project: string;
  assignee: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  status: "Todo" | "In Progress" | "QA" | "Done";
  dueDate: string;
}

export const initialTasks: Task[] = [
  { id: 1, title: "Refactor main layout header menu", project: "SaiFlow ERP Phase 1", assignee: "John Doe", priority: "High", status: "In Progress", dueDate: "2026-07-15" },
  { id: 2, title: "Configure PostgreSQL DB schema", project: "Neural Link Integration", assignee: "Robert Lee", priority: "Critical", status: "Todo", dueDate: "2026-07-20" },
  { id: 3, title: "Fix API route authorization bugs", project: "Cargo Tracking System", assignee: "Jane Smith", priority: "High", status: "QA", dueDate: "2026-07-14" },
  { id: 4, title: "Write end-to-end integration tests", project: "Cloud Migration Pipeline", assignee: "Alice Johnson", priority: "Medium", status: "Done", dueDate: "2026-06-28" },
  { id: 5, title: "Draft wireframes for client settings panel", project: "Customer Portal Redesign", assignee: "Emma Watson", priority: "Low", status: "Todo", dueDate: "2026-07-18" }
];
