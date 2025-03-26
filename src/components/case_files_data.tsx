type CaseStatus = "Pending" | "In Progress" | "Closed" | "On Hold";
type PriorityLevel = "High" | "Medium" | "Low";

interface CaseFile {
  caseId: string;
  title: string;
  status: CaseStatus;
  dateOpened: string;
  lastUpdated: string;
  assignedStaff: string;
  priority: PriorityLevel;
  category: string;
  resolutionDate?: string;
  nextActionDue?: string;
  attachments?: string[];
  comments?: string;
}

const caseFiles: CaseFile[] = [
  {
    caseId: "C001",
    title: "Doe v. ABC Corp",
    status: "In Progress",
    dateOpened: "2024-03-10",
    lastUpdated: "2024-03-20",
    assignedStaff: "John Smith",
    priority: "High",
    category: "Legal Dispute",
    nextActionDue: "2024-03-25",
    attachments: ["contract.pdf", "evidence.jpg"],
    comments: "Awaiting client response.",
  },
  {
    caseId: "C002",
    title: "HR Complaint - Workplace Harassment",
    status: "Pending",
    dateOpened: "2024-02-15",
    lastUpdated: "2024-03-01",
    assignedStaff: "Emily Johnson",
    priority: "Medium",
    category: "HR Complaint",
    comments: "Initial interview scheduled.",
  },
  {
    caseId: "C003",
    title: "Fraud Investigation - Embezzlement",
    status: "Closed",
    dateOpened: "2023-12-01",
    lastUpdated: "2024-01-15",
    assignedStaff: "Michael Brown",
    priority: "High",
    category: "Fraud",
    resolutionDate: "2024-01-15",
    comments: "Case closed successfully.",
  },
  {
    caseId: "C004",
    title: "Property Dispute Settlement",
    status: "On Hold",
    dateOpened: "2024-01-20",
    lastUpdated: "2024-02-10",
    assignedStaff: "Sarah Williams",
    priority: "Low",
    category: "Legal Dispute",
    nextActionDue: "2024-04-01",
  },
];

export default caseFiles;
