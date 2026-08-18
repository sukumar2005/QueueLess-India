const documentCenterData = [
  {
    name: "Aadhaar Services",
    department: "UIDAI Services",
    office: "Aadhaar Seva Centre",
    category: "Identity",
    purpose:
      "Update or correct Aadhaar details for identity and address verification.",
    officerRole: "Aadhaar Enrolment Operator",
    processingTime: "Approximately 7 working days",
    documents: ["Aadhaar Card", "Identity Proof", "Address Proof"],
    averageTime: 15,
  },
  {
    name: "Birth Certificate",
    department: "Municipal Administration",
    office: "Municipal Office",
    category: "Certificates",
    purpose:
      "Obtain official proof of birth for school admission, identity records and government services.",
    officerRole: "Municipal Officer",
    processingTime: "Approximately 7 working days",
    documents: ["Hospital Birth Record", "Parent ID Proof", "Address Proof"],
    averageTime: 15,
  },
  {
    name: "Community Certificate",
    department: "Revenue Department",
    office: "Taluk Office",
    category: "Certificates",
    purpose:
      "Apply for a community certificate for eligible government schemes, education and reservation benefits.",
    officerRole: "VAO / Revenue Officer",
    processingTime: "Approximately 15 working days",
    documents: ["Aadhaar Card", "Address Proof", "Parent Community Certificate"],
    averageTime: 20,
  },
  {
    name: "Income Certificate",
    department: "Revenue Department",
    office: "Taluk Office",
    category: "Certificates",
    purpose:
      "Show family income for scholarships, welfare schemes and fee concessions.",
    officerRole: "VAO / Revenue Officer",
    processingTime: "Approximately 7 working days",
    documents: ["Aadhaar Card", "Address Proof", "Income Proof"],
    averageTime: 20,
  },
  {
    name: "Caste/Community Certificate",
    department: "Revenue Department",
    office: "Taluk Office",
    category: "Certificates",
    purpose:
      "Provide community status information for eligible education, employment and welfare benefits.",
    officerRole: "VAO / Revenue Officer",
    processingTime: "Approximately 15 working days",
    documents: ["Aadhaar Card", "Address Proof", "Parent Community Certificate"],
    averageTime: 20,
  },
  {
    name: "Residence Certificate",
    department: "Revenue Department",
    office: "Taluk Office",
    category: "Certificates",
    purpose:
      "Show current residential address for government and local body services.",
    officerRole: "VAO / Revenue Officer",
    processingTime: "Approximately 7 working days",
    documents: ["Aadhaar Card", "Address Proof", "Electricity Bill"],
    averageTime: 15,
  },
  {
    name: "Nativity Certificate",
    department: "Revenue Department",
    office: "Taluk Office",
    category: "Certificates",
    purpose:
      "Show native place information for eligible state services and admissions.",
    officerRole: "Revenue Officer",
    processingTime: "Approximately 15 working days",
    documents: ["Aadhaar Card", "Address Proof", "Parent Proof"],
    averageTime: 20,
  },
  {
    name: "Legal Heir Certificate",
    department: "Revenue Department",
    office: "Taluk Office",
    category: "Certificates",
    purpose:
      "Identify legal heirs for claims, transfers and government processes.",
    officerRole: "Tahsildar / Revenue Officer",
    processingTime: "Approximately 15 working days",
    documents: ["Death Certificate", "Applicant ID Proof", "Family Details"],
    averageTime: 25,
  },
  {
    name: "Driving Licence",
    department: "Transport Department",
    office: "RTO Office",
    category: "Transport",
    purpose:
      "Apply for or update a driving licence through the transport department.",
    officerRole: "RTO Officer",
    processingTime: "Approximately 10 working days",
    documents: ["Learner Licence", "Aadhaar Card", "Address Proof"],
    averageTime: 30,
  },
  {
    name: "Property Registration",
    department: "Registration Department",
    office: "Sub-Registrar Office",
    category: "Registration",
    purpose:
      "Register property sale, transfer or related property documents.",
    officerRole: "Registrar",
    processingTime: "Approximately 3 working days",
    documents: [
      "Sale Deed",
      "Identity Proof",
      "Property Documents",
      "Stamp Duty Receipt",
    ],
    averageTime: 40,
  },
  {
    name: "Marriage Certificate",
    department: "Registration Department",
    office: "Sub-Registrar Office",
    category: "Certificates",
    purpose:
      "Register marriage and obtain an official marriage certificate.",
    officerRole: "Registrar",
    processingTime: "Approximately 7 working days",
    documents: ["Age Proof", "Address Proof", "Marriage Proof", "Witness ID"],
    averageTime: 25,
  },
  {
    name: "Death Certificate",
    department: "Municipal Administration",
    office: "Municipal Office",
    category: "Certificates",
    purpose:
      "Obtain official death record for legal, family and benefit claims.",
    officerRole: "Municipal Officer",
    processingTime: "Approximately 7 working days",
    documents: ["Hospital Death Record", "Applicant ID Proof", "Address Proof"],
    averageTime: 15,
  },
  {
    name: "Ration Card",
    department: "Civil Supplies Department",
    office: "Civil Supplies Office",
    category: "Public Distribution",
    purpose:
      "Apply for or update ration card details for public distribution services.",
    officerRole: "Civil Supplies Officer",
    processingTime: "Approximately 15 working days",
    documents: ["Aadhaar Card", "Address Proof", "Family Member Details"],
    averageTime: 20,
  },
  {
    name: "Voter ID related services",
    department: "Election Department",
    office: "Election Office",
    category: "Identity",
    purpose:
      "Apply for voter registration, correction or address changes.",
    officerRole: "Election Officer",
    processingTime: "Approximately 15 working days",
    documents: ["Age Proof", "Address Proof", "Photo"],
    averageTime: 20,
  },
  {
    name: "Pension-related services",
    department: "Social Welfare Department",
    office: "Social Welfare Office",
    category: "Welfare",
    purpose:
      "Apply for eligible pension and welfare assistance schemes.",
    officerRole: "Welfare Officer",
    processingTime: "Approximately 30 working days",
    documents: ["Aadhaar Card", "Income Proof", "Bank Passbook", "Age Proof"],
    averageTime: 25,
  },
];

const defaultApplicationSteps = [
  "Prepare documents",
  "Visit/apply online",
  "Submit application",
  "Verification",
  "Approval",
  "Certificate issued",
];

const defaultGuidance =
  "This prototype information is structured for citizen guidance. For production use, verify official requirements with the relevant department.";

module.exports = {
  documentCenterData,
  defaultApplicationSteps,
  defaultGuidance,
};
