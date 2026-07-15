export type MeetingStatus = "Scheduled" | "Completed" | "Cancelled" | "Rescheduled";

export interface Meeting {
  id: number;
  subject: string;
  company: string;
  contactPerson: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  type: string; // Google Meet, Zoom, Offline, etc. (Matches Platform / Type)
  linkOrLocation: string;
  status: MeetingStatus;
  notes: string;

  // Workflow fields
  summary?: string;
  rescheduledDate?: string;
  rescheduledTime?: string;
  completedDate?: string;
  cancelledDate?: string;

  // New Upgrade Fields
  relatedToType?: "Lead" | "Client";
  relatedToId?: number;
  meetingType?: string; // Online, Offline, Client Visit, Office Meeting, Demo Meeting, Requirement Discussion, Review Meeting
  meetingPlatform?: string; // Google Meet, Zoom, Microsoft Teams, Office, Client Office
  startTime?: string;
  endTime?: string;
  duration?: string;
  timezone?: string;
  meetingOwner?: string[]; // Employees (Multi-Select)
  clientContactPerson?: string;
  attendees?: string;
  agenda?: string;
  discussionPoints?: string;
  requirements?: string;
  remarks?: string;
  nextAction?: string;
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
    date: "2026-07-09",
    time: "10:30",
    type: "Google Meet",
    linkOrLocation: "https://meet.google.com/abc-defg-hij",
    status: "Scheduled",
    notes: "Go through company presentation slides and introduce standard modules. Client showed interest in the CRM dashboard and reporting features.",
    relatedToType: "Lead",
    relatedToId: 1,
    meetingType: "Discovery Call",
    meetingPlatform: "Google Meet",
    startTime: "10:30",
    endTime: "11:00",
    duration: "30 mins",
    timezone: "IST",
    meetingOwner: ["John Doe"],
    clientContactPerson: "Alice Smith",
    attendees: "John Doe, Alice Smith, Michael Chen",
    agenda: "Gather initial scope and demo core templates.",
    discussionPoints: "Introduced SaiFlow CRM components. Client interested in lead management and meeting scheduling modules.",
    requirements: "Requires leads and meetings dashboard with custom role permissions.",
    remarks: "Good initial response. Alice is the decision maker.",
    nextAction: "Create Follow-up"
  },
  {
    id: 2,
    subject: "Pricing & License Discussion",
    company: "Innovate LLC",
    contactPerson: "Bob Jones",
    date: "2026-07-09",
    time: "14:00",
    type: "Google Meet",
    linkOrLocation: "https://meet.google.com/xyz-pqrs-tuv",
    status: "Rescheduled",
    notes: "Postponed by client from morning to afternoon. Need to present pricing tiers.",
    relatedToType: "Lead",
    relatedToId: 2,
    meetingType: "Demo Meeting",
    meetingPlatform: "Google Meet",
    startTime: "14:00",
    endTime: "14:45",
    duration: "45 mins",
    timezone: "IST",
    meetingOwner: ["Jane Smith"],
    clientContactPerson: "Bob Jones",
    attendees: "Jane Smith, Bob Jones, Sarah Lee",
    agenda: "Go over price cards and workspace limits.",
    discussionPoints: "Discussed custom roles configuration requirements. Bob requested a detailed proposal for 10 users.",
    requirements: "Client needs 10 user licenses with custom role-based access control.",
    remarks: "Client requested follow-up proposal. Budget seems approved.",
    nextAction: "Schedule Next Meeting",
    summary: "Client was not available in the morning, rescheduled to afternoon. Discussed pricing tiers for enterprise plan.",
    rescheduledDate: "2026-07-09",
    rescheduledTime: "14:00"
  },
  {
    id: 3,
    subject: "Detailed Technical Demo",
    company: "Apex digital",
    contactPerson: "Charlie Brown",
    date: "2026-07-10",
    time: "11:00",
    type: "Google Meet",
    linkOrLocation: "https://meet.google.com/mno-lkiu-asd",
    status: "Scheduled",
    notes: "Present API integration flow and database schemas. Technical team will attend.",
    relatedToType: "Lead",
    relatedToId: 3,
    meetingType: "Requirement Discussion",
    meetingPlatform: "Google Meet",
    startTime: "11:00",
    endTime: "12:00",
    duration: "60 mins",
    timezone: "IST",
    meetingOwner: ["John Doe"],
    clientContactPerson: "Charlie Brown",
    attendees: "John Doe, Charlie Brown, David Kim, Priya Sharma",
    agenda: "Detailed technical architecture walkthrough.",
    discussionPoints: "Demonstrated custom role permission matrix. Discussed API integration patterns and webhook support.",
    requirements: "Needs robust API for connecting standard databases and third-party integrations.",
    remarks: "Highly technical team. They want to see the API documentation.",
    nextAction: "Create Quotation"
  },
  {
    id: 4,
    subject: "Project Kickoff & Timeline Planning",
    company: "Nextgen software",
    contactPerson: "Diana Prince",
    date: "2026-07-18",
    time: "10:30",
    type: "Microsoft Teams",
    linkOrLocation: "https://teams.microsoft.com/meet/nextgen-abc123",
    status: "Scheduled",
    notes: "Kickoff meeting to finalize project roadmap and assign team responsibilities.",
    relatedToType: "Lead",
    relatedToId: 4,
    meetingType: "Review Meeting",
    meetingPlatform: "Microsoft Teams",
    startTime: "10:30",
    endTime: "11:30",
    duration: "60 mins",
    timezone: "IST",
    meetingOwner: ["Jane Smith", "John Doe"],
    clientContactPerson: "Diana Prince",
    attendees: "Jane Smith, John Doe, Diana Prince, Bruce Wayne",
    agenda: "Finalize project scope, milestones, and resource allocation.",
    discussionPoints: "Reviewed project requirements. Diana wants bi-weekly sprint reviews.",
    requirements: "Requires dedicated development team with QA support. Timeline: 4 months.",
    remarks: "Diana is very organized. She shared a detailed BRD document.",
    nextAction: "Create Quotation"
  }
];
