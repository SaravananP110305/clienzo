export interface Project {
  id: number;
  name: string;
  client: string;
  category: string;
  startDate: string;
  deadline: string;
  status: "Planning" | "In Progress" | "On Hold" | "Completed";
  progress: number; // 0 to 100
}

export const initialProjects: Project[] = [
  { id: 1, name: "SaiFlow ERP Phase 1", client: "Aventis Technologies", category: "ERP Software", startDate: "2026-06-01", deadline: "2026-08-31", status: "In Progress", progress: 65 },
  { id: 2, name: "Neural Link Integration", client: "Cyberdyne Systems", category: "R&D Software", startDate: "2026-07-01", deadline: "2026-12-31", status: "In Progress", progress: 20 },
  { id: 3, name: "Cargo Tracking System", client: "SpaceX Logistics", category: "Logistics App", startDate: "2026-05-15", deadline: "2026-07-15", status: "In Progress", progress: 90 },
  { id: 4, name: "Cloud Migration Pipeline", client: "Alphabet Web Services", category: "DevOps Services", startDate: "2026-03-10", deadline: "2026-06-30", status: "Completed", progress: 100 },
  { id: 5, name: "Customer Portal Redesign", client: "Kingfisher Solutions", category: "Web Design", startDate: "2026-07-10", deadline: "2026-09-10", status: "Planning", progress: 5 }
];
