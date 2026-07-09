export type MeetingType = "Google Meet" | "Offline";
export type MeetingStatus = "Scheduled" | "Completed" | "Cancelled" | "Rescheduled";

export interface Meeting {
  id: number;
  subject: string;
  company: string;
  contactPerson: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  type: MeetingType;
  linkOrLocation: string;
  status: MeetingStatus;
  notes: string;
}

export const getMeetingStatusColor = (
  status: MeetingStatus
): "primary" | "success" | "warning" | "error" | "info" | "light" => {
  switch (status) {
    case "Completed":
      return "success";
    case "Scheduled":
      return "primary";
    case "Rescheduled":
      return "info";
    case "Cancelled":
      return "error";
    default:
      return "light";
  }
};

export const initialMeetings: Meeting[] = [
  {
    id: 1,
    subject: "Discovery Call & Product Intro",
    company: "Tech solutions",
    contactPerson: "Alice Smith",
    date: "2026-07-09", // Today
    time: "10:30",
    type: "Google Meet",
    linkOrLocation: "https://meet.google.com/abc-defg-hij",
    status: "Scheduled",
    notes: "Go through company presentation slides and introduce standard modules.",
  },
  {
    id: 2,
    subject: "Pricing & License Discussion",
    company: "Innovate LLC",
    contactPerson: "Bob Jones",
    date: "2026-07-09", // Today
    time: "14:00",
    type: "Google Meet",
    linkOrLocation: "https://meet.google.com/xyz-pqrs-tuv",
    status: "Rescheduled",
    notes: "Postponed by client from morning to afternoon.",
  },
  {
    id: 3,
    subject: "Detailed Technical Demo",
    company: "Apex digital",
    contactPerson: "Charlie Brown",
    date: "2026-07-10", // Upcoming
    time: "11:00",
    type: "Google Meet",
    linkOrLocation: "https://meet.google.com/mno-lkiu-asd",
    status: "Scheduled",
    notes: "Present API integration flow and database schemas.",
  },
  {
    id: 4,
    subject: "On-site Contract Negotiation",
    company: "Quantum systems",
    contactPerson: "Evan Wright",
    date: "2026-07-15", // Upcoming
    time: "15:30",
    type: "Offline",
    linkOrLocation: "Level 14, 654 Innovation Dr, Austin, TX",
    status: "Scheduled",
    notes: "In-person negotiation of pricing slabs and legal terms.",
  },
  {
    id: 5,
    subject: "Initial Discovery Call",
    company: "Summit labs",
    contactPerson: "Ian Malcolm",
    date: "2026-07-05", // Completed
    time: "09:30",
    type: "Google Meet",
    linkOrLocation: "https://meet.google.com/vbc-nhyg-asd",
    status: "Completed",
    notes: "Gathered high-level requirements. Client qualified for enterprise package.",
  },
  {
    id: 6,
    subject: "Proposal Review Call",
    company: "Alpha media",
    contactPerson: "Fiona Gallagher",
    date: "2026-07-03", // Completed
    time: "16:00",
    type: "Google Meet",
    linkOrLocation: "https://meet.google.com/qwe-rtyu-iop",
    status: "Cancelled",
    notes: "Cancelled because client budget was cut. Mark lead as lost.",
  },
];
