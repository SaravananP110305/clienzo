export interface Requirement {
  id: number;
  title: string;
  client: string;
  techStack: string;
  priority: "High" | "Medium" | "Low";
  status: "In Review" | "Approved" | "Under Development" | "Implemented";
  date: string;
}

export const initialRequirements: Requirement[] = [
  { id: 1, title: "Custom Dashboard Charts Integration", client: "Aventis Technologies", techStack: "React, ApexCharts, Tailwind", priority: "High", status: "In Review", date: "2026-07-10" },
  { id: 2, title: "Stripe Payment Gateway Integration", client: "SpaceX Logistics", techStack: "Node.js, Express, Stripe API", priority: "High", status: "Approved", date: "2026-07-11" },
  { id: 3, title: "Automated Report Export to PDF", client: "Alphabet Web Services", techStack: "Python, ReportLab, AWS Lambda", priority: "Medium", status: "Under Development", date: "2026-07-12" },
  { id: 4, title: "Multilingual Support (i18n)", client: "Cyberdyne Systems", techStack: "React, i18next", priority: "Low", status: "Approved", date: "2026-07-12" },
  { id: 5, title: "Access Control permission matrix layout", client: "Aventis Technologies", techStack: "React, Redux, PostgreSQL", priority: "High", status: "Implemented", date: "2026-07-13" }
];
