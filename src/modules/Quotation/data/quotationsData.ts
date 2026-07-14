
export interface Quotation {
  id: number;
  quotationNo: string;
  client: string;
  category: string;
  amount: number;
  status: "Draft" | "Sent" | "Approved" | "Declined";
  date: string;
}

export const initialQuotations: Quotation[] = [
  { id: 1, quotationNo: "QT-2026-001", client: "Aventis Technologies", category: "Web ERP Platform", amount: 45000, status: "Approved", date: "2026-07-05" },
  { id: 2, quotationNo: "QT-2026-002", client: "SpaceX Logistics", category: "Mobile Fleet Tracker", amount: 28000, status: "Sent", date: "2026-07-08" },
  { id: 3, quotationNo: "QT-2026-003", client: "Alphabet Web Services", category: "Big Data Processing Integration", amount: 62000, status: "Draft", date: "2026-07-11" },
  { id: 4, quotationNo: "QT-2026-004", client: "Cyberdyne Systems", category: "AI Analytics Dashboard", amount: 95000, status: "Approved", date: "2026-07-12" },
  { id: 5, quotationNo: "QT-2026-005", client: "Kingfisher Solutions", category: "E-Commerce Upgrade", amount: 15000, status: "Declined", date: "2026-07-13" }
];
