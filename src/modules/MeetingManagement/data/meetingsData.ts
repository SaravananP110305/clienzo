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
    date: "2026-07-09", // Today
    time: "10:30",
    type: "Google Meet",
    linkOrLocation: "https://meet.google.com/abc-defg-hij",
    status: "Scheduled",
    notes: "Go through company presentation slides and introduce standard modules.",
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
    attendees: "John Doe, Alice Smith",
    agenda: "Gather initial scope and demo core templates.",
    discussionPoints: "Introduced SaiFlow CRM components.",
    requirements: "Requires leads and meetings dashboard.",
    remarks: "Good initial response.",
    nextAction: "Create Follow-up"
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
    attendees: "Jane Smith, Bob Jones",
    agenda: "Go over price cards and workspace limits.",
    discussionPoints: "Discussed custom roles configuration requirements.",
    requirements: "Client needs 10 user licenses.",
    remarks: "Client requested follow-up proposal.",
    nextAction: "Schedule Next Meeting"
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
    attendees: "John Doe, Charlie Brown",
    agenda: "Detailed technical architecture walkthrough.",
    discussionPoints: "Demonstrated custom role permission matrix.",
    requirements: "Needs robust API for connecting standard databases.",
    remarks: "Highly technical team.",
    nextAction: "Create Quotation"
  }
];
