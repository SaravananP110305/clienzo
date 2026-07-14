export interface Client {
  id: number;
  name: string; // Contact Name
  company: string; // Company Name
  email: string; // Contact Email
  phone: string; // Contact Phone / Mobile
  projectsCount: number;
  status: "Active" | "Inactive" | "Blacklisted";

  // Company Profile
  industry?: string;
  gstNumber?: string;
  panNumber?: string;
  website?: string;
  companyEmail?: string;
  companyPhone?: string;

  // Address
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;

  // Primary Contact details (explicit)
  contactName?: string;
  designation?: string;
  mobile?: string;

  // Relationship
  relationshipManager?: string;
  accountManager?: string;

  // Business Details
  clientSince?: string;
  paymentTerms?: string;
  preferredCommunication?: string;
  creditLimit?: string;
}

export const initialClients: Client[] = [
  {
    id: 1,
    name: "Arvind Swamy",
    company: "Aventis Technologies",
    email: "arvind@aventis.com",
    phone: "9445212056",
    projectsCount: 2,
    status: "Active",
    industry: "Information Technology",
    gstNumber: "29AAAAA0000A1Z1",
    panNumber: "AAAAA0000A",
    website: "https://aventis.com",
    companyEmail: "info@aventis.com",
    companyPhone: "08025251122",
    address: "45 Tech Corridor, ITPL Road",
    city: "Bangalore",
    state: "Karnataka",
    country: "India",
    pincode: "560066",
    contactName: "Arvind Swamy",
    designation: "BD Director",
    mobile: "9445212056",
    relationshipManager: "John Doe",
    accountManager: "Jane Smith",
    clientSince: "2024-01-10",
    paymentTerms: "Net 30",
    preferredCommunication: "Email",
    creditLimit: "500000"
  },
  {
    id: 2,
    name: "Sarah Connor",
    company: "Cyberdyne Systems",
    email: "sarah@cyberdyne.com",
    phone: "5550192831",
    projectsCount: 1,
    status: "Active",
    industry: "Manufacturing",
    gstNumber: "",
    panNumber: "",
    website: "https://cyberdyne.com",
    companyEmail: "contact@cyberdyne.com",
    companyPhone: "5550192830",
    address: "7400 Robotics Way",
    city: "San Francisco",
    state: "California",
    country: "United States",
    pincode: "94107",
    contactName: "Sarah Connor",
    designation: "Operations Lead",
    mobile: "5550192831",
    relationshipManager: "Alice Johnson",
    accountManager: "Robert Lee",
    clientSince: "2024-03-15",
    paymentTerms: "Net 15",
    preferredCommunication: "Phone",
    creditLimit: "1000000"
  },
  {
    id: 3,
    name: "Vijay Mallya",
    company: "Kingfisher Solutions",
    email: "vijay@kingfisher.com",
    phone: "9884088200",
    projectsCount: 0,
    status: "Inactive",
    industry: "Retail",
    gstNumber: "27BBBBB0000B1Z2",
    panNumber: "BBBBB0000B",
    website: "https://kingfisher.com",
    companyEmail: "support@kingfisher.com",
    companyPhone: "02266009988",
    address: "Kingfisher House, Vile Parle",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    pincode: "400057",
    contactName: "Vijay Mallya",
    designation: "Chairman",
    mobile: "9884088200",
    relationshipManager: "Robert Lee",
    accountManager: "John Doe",
    clientSince: "2023-11-20",
    paymentTerms: "Immediate",
    preferredCommunication: "WhatsApp",
    creditLimit: "0"
  }
];
