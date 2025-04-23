// type CaseStatus = "Pending" | "In Progress" | "Closed" | "On Hold";
// type PriorityLevel = "High" | "Medium" | "Low";

import { File, getAllFiles } from "../services/files";

// interface CaseFile {
//   caseId: string;
//   title: string;
//   status: CaseStatus;
//   dateOpened: string;
//   lastUpdated: string;
//   assignedStaff: string;
//   priority: PriorityLevel;
//   category: string;
//   resolutionDate?: string;
//   nextActionDue?: string;
//   attachments?: CaseFileAttachment[];
//   comments?: string;
// }

// interface CaseFileAttachment {
//   fileId: string;
//   fileName: string;
//   caseTitle: string;
//   uploadedBy: string;
//   dateUploaded: string;
//   fileType: string;
//   size: string;
// }

// export const fileSectionData: CaseFileAttachment[] = [
//   {
//     fileId: "F001",
//     fileName: "Investigation_Report.pdf",
//     caseTitle: "Fraud Investigation",
//     uploadedBy: "John Doe",
//     dateUploaded: "2025-03-24",
//     fileType: "PDF",
//     size: "1.2MB",
//   },
//   {
//     fileId: "F002",
//     fileName: "Contract_Agreement.docx",
//     caseTitle: "Contract Dispute",
//     uploadedBy: "Jane Smith",
//     dateUploaded: "2025-03-20",
//     fileType: "DOCX",
//     size: "890KB",
//   },
//   {
//     fileId: "F003",
//     fileName: "CCTV_Footage.mp4",
//     caseTitle: "Security Breach",
//     uploadedBy: "Security Team",
//     dateUploaded: "2025-03-18",
//     fileType: "MP4",
//     size: "15MB",
//   },
//   {
//     fileId: "F004",
//     fileName: "Signed_Affidavit.pdf",
//     caseTitle: "Legal Matter",
//     uploadedBy: "Attorney General",
//     dateUploaded: "2025-03-10",
//     fileType: "PDF",
//     size: "650KB",
//   },
//   {
//     fileId: "F005",
//     fileName: "Medical_Report.jpeg",
//     caseTitle: "Injury Claim",
//     uploadedBy: "Dr. Emily Carter",
//     dateUploaded: "2025-03-05",
//     fileType: "JPEG",
//     size: "300KB",
//   },
// ];

export let fileSectionData: File[] = [];

export const fetchFileData = async (): Promise<File[]> => {
  try {
    // Fetch all staff data
    const files = await getAllFiles();

    fileSectionData = files;

    files.map((file) => {
      if (file.deleted == true) {
        fileSectionData = fileSectionData.filter(
          (f) => f.file_id !== file.file_id
        );
      }
    });

    return fileSectionData;
  } catch (error) {
    console.error("Error fetching staff data:", error);
  }

  console.log("fileSectionData", fileSectionData);

  return fileSectionData;
};

fetchFileData();

// export default fileSectionData;
