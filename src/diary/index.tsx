import {
  Button,
  Calendar,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  useDisclosure,
} from "@heroui/react";
import { isWeekend } from "@internationalized/date";
import { useLocale } from "@react-aria/i18n";
import { saveAs } from "file-saver";
import {
  Bell,
  CalendarDays,
  Clock,
  Download,
  FileText,
  Mail,
  MessageCircle,
  MoreVertical,
  Phone,
  Printer,
  Share2,
} from "lucide-react";
import { useState } from "react";
import * as XLSX from "xlsx";
import { fileSectionData as caseFiles } from "../components/files_data";
import LeftPanel from "../components/left_panel";
import NavbarSection from "../components/navbar";
import RightPanel from "../components/right_panel";
import ViewCaseFileModal from "../components/view_case_file_modal";
import { useAuth } from "../context/auth_context";

function CalendarItem() {
  const [selectedDate, setSelectedDate] = useState<any>(null);
  // let now = today(getLocalTimeZone());
  let { locale } = useLocale();
  const [fileID, setFileID] = useState<number>(0);

  // Disable Fridays with a max of 7 judgements and 3 rulings
  // let disabledRanges = [
  //   caseFiles
  //     .map((file) => {
  //       let date = new Date(file.required_on);

  //       if (date.getDay() === 5) {
  //         let judgements = caseFiles.filter(
  //           (file) =>
  //             file.case_type === "Judgement" &&
  //             file.required_on === date.toString()
  //         ).length;
  //         let rulings = caseFiles.filter(
  //           (file) =>
  //             file.case_type === "Ruling" &&
  //             file.required_on === date.toString()
  //         ).length;

  //         if (judgements >= 7 || rulings >= 3) {
  //           return date;
  //         } else {
  //           return [null, null];
  //         }
  //       }
  //       return null;
  //     })
  //     .filter((date) => date !== null),
  // ];

  let isDateUnavailable = (date: any) => isWeekend(date, locale);

  // Filter cases for the selected date
  const matchingCases = caseFiles?.filter(
    (file) =>
      selectedDate &&
      new Date(file.required_on).toISOString().split("T")[0] ===
        selectedDate.toString()
  );

  const { isOpen: isOpenView, onOpenChange: onOpenChangeView } =
    useDisclosure();

  // Enhanced export function to Excel format with advanced styling
  function exportCasesToExcel(cases: any[], date: any) {
    if (!cases || cases.length === 0) return;

    const formattedDate = new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const exportData = cases.map((c, index) => ({
      "Case Number": c.case_number || `Case ${index + 1}`,
      "Case Type": c.case_type || "N/A",
      Purpose: c.purpose || "N/A",
      "Scheduled Time": new Date(c.required_on).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      Notes: c.notes || "No notes",
    }));

    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Create header information with enhanced styling
    const headerData = [
      [`KILUNGU LAW COURTS - COURT SCHEDULE`],
      [`${formattedDate}`],
      [
        `Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
      ],
      [
        `Total Cases: ${cases.length} scheduled hearing${
          cases.length !== 1 ? "s" : ""
        }`,
      ],
      [], // Empty row for spacing
      [], // Another empty row for better spacing
    ];

    // Add column headers
    const columnHeaders = Object.keys(exportData[0]);
    headerData.push(columnHeaders);

    // Add data rows
    exportData.forEach((row) => {
      headerData.push(Object.values(row));
    });

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(headerData);

    // Enhanced column widths
    const colWidths = [
      { wch: 18 }, // Case Number
      { wch: 15 }, // Case Type
      { wch: 35 }, // Purpose
      { wch: 22 }, // Scheduled Time
      { wch: 45 }, // Notes
    ];
    ws["!cols"] = colWidths;

    // Main title styling (A1)
    const titleStyle = {
      font: { bold: true, sz: 16, color: { rgb: "1E40AF" } },
      alignment: { horizontal: "center", vertical: "center" },
      fill: { fgColor: { rgb: "E3F2FD" } },
      border: {
        top: { style: "thick", color: { rgb: "1E40AF" } },
        bottom: { style: "thick", color: { rgb: "1E40AF" } },
        left: { style: "thick", color: { rgb: "1E40AF" } },
        right: { style: "thick", color: { rgb: "1E40AF" } },
      },
    };

    // Date styling (A2)
    const dateStyle = {
      font: { bold: true, sz: 14, color: { rgb: "374151" } },
      alignment: { horizontal: "center", vertical: "center" },
      fill: { fgColor: { rgb: "F8FAFC" } },
      border: {
        top: { style: "thin", color: { rgb: "E5E7EB" } },
        bottom: { style: "thin", color: { rgb: "E5E7EB" } },
        left: { style: "thin", color: { rgb: "E5E7EB" } },
        right: { style: "thin", color: { rgb: "E5E7EB" } },
      },
    };

    // Generation info styling (A3)
    const infoStyle = {
      font: { sz: 10, color: { rgb: "6B7280" } },
      alignment: { horizontal: "center", vertical: "center" },
      fill: { fgColor: { rgb: "F9FAFB" } },
      border: {
        top: { style: "thin", color: { rgb: "E5E7EB" } },
        bottom: { style: "thin", color: { rgb: "E5E7EB" } },
        left: { style: "thin", color: { rgb: "E5E7EB" } },
        right: { style: "thin", color: { rgb: "E5E7EB" } },
      },
    };

    // Total cases styling (A4)
    const totalStyle = {
      font: { bold: true, sz: 11, color: { rgb: "1F2937" } },
      alignment: { horizontal: "center", vertical: "center" },
      fill: { fgColor: { rgb: "DBEAFE" } },
      border: {
        top: { style: "thin", color: { rgb: "3B82F6" } },
        bottom: { style: "thin", color: { rgb: "3B82F6" } },
        left: { style: "thin", color: { rgb: "3B82F6" } },
        right: { style: "thin", color: { rgb: "3B82F6" } },
      },
    };

    // Column headers styling (Row 7)
    const columnHeaderStyle = {
      font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
      alignment: { horizontal: "center", vertical: "center" },
      fill: { fgColor: { rgb: "1E40AF" } },
      border: {
        top: { style: "medium", color: { rgb: "1E40AF" } },
        bottom: { style: "medium", color: { rgb: "1E40AF" } },
        left: { style: "thin", color: { rgb: "FFFFFF" } },
        right: { style: "thin", color: { rgb: "FFFFFF" } },
      },
    };

    // Data row styling
    const dataRowStyle = {
      font: { sz: 10, color: { rgb: "1F2937" } },
      alignment: { horizontal: "left", vertical: "center", wrapText: true },
      border: {
        top: { style: "thin", color: { rgb: "E5E7EB" } },
        bottom: { style: "thin", color: { rgb: "E5E7EB" } },
        left: { style: "thin", color: { rgb: "E5E7EB" } },
        right: { style: "thin", color: { rgb: "E5E7EB" } },
      },
    };

    // Alternating row colors
    const evenRowStyle = {
      ...dataRowStyle,
      fill: { fgColor: { rgb: "F9FAFB" } },
    };

    const oddRowStyle = {
      ...dataRowStyle,
      fill: { fgColor: { rgb: "FFFFFF" } },
    };

    // Apply styles to header cells
    if (ws["A1"]) ws["A1"].s = titleStyle;
    if (ws["A2"]) ws["A2"].s = dateStyle;
    if (ws["A3"]) ws["A3"].s = infoStyle;
    if (ws["A4"]) ws["A4"].s = totalStyle;

    // Merge cells for headers
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }, // Title row
      { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } }, // Date row
      { s: { r: 2, c: 0 }, e: { r: 2, c: 4 } }, // Generated info row
      { s: { r: 3, c: 0 }, e: { r: 3, c: 4 } }, // Total cases row
    ];

    // Apply column header styles
    columnHeaders.forEach((_, index) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 6, c: index });
      if (ws[cellAddress]) ws[cellAddress].s = columnHeaderStyle;
    });

    // Apply data row styles with alternating colors
    exportData.forEach((_, rowIndex) => {
      const actualRowIndex = rowIndex + 7; // Starting from row 8 (0-indexed)
      const isEvenRow = rowIndex % 2 === 0;

      columnHeaders.forEach((_, colIndex) => {
        const cellAddress = XLSX.utils.encode_cell({
          r: actualRowIndex,
          c: colIndex,
        });
        if (ws[cellAddress]) {
          ws[cellAddress].s = isEvenRow ? evenRowStyle : oddRowStyle;

          // Special styling for case numbers
          if (colIndex === 0) {
            ws[cellAddress].s = {
              ...ws[cellAddress].s,
              font: {
                ...ws[cellAddress].s.font,
                bold: true,
                color: { rgb: "1E40AF" },
              },
            };
          }

          // Special styling for case types
          if (colIndex === 1) {
            ws[cellAddress].s = {
              ...ws[cellAddress].s,
              font: {
                ...ws[cellAddress].s.font,
                bold: true,
                color: { rgb: "059669" },
              },
              alignment: { horizontal: "center", vertical: "center" },
            };
          }

          // Special styling for scheduled time
          if (colIndex === 3) {
            ws[cellAddress].s = {
              ...ws[cellAddress].s,
              font: {
                ...ws[cellAddress].s.font,
                bold: true,
                color: { rgb: "DC2626" },
              },
              alignment: { horizontal: "center", vertical: "center" },
            };
          }
        }
      });
    });

    // Set row heights for better appearance
    ws["!rows"] = [
      { hpt: 25 }, // Title row
      { hpt: 20 }, // Date row
      { hpt: 15 }, // Generated info row
      { hpt: 18 }, // Total cases row
      { hpt: 10 }, // Empty row
      { hpt: 10 }, // Empty row
      { hpt: 22 }, // Column headers
      ...exportData.map(() => ({ hpt: 35 })), // Data rows with increased height for wrapping
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Court Schedule");

    // Generate Excel file and download
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `Court_Schedule_${date}_${cases.length}_Cases.xlsx`);
  }

  // Enhanced print function with professional formatting
  function printCases(cases: any[], date: any) {
    const formattedDate = new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const currentTime = new Date();
    const generatedTime = currentTime.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    // Calculate statistics
    const caseTypes = cases.reduce((acc, file) => {
      const type = file.case_type || "Other";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const printContent = `
      <html>
        <head>
          <title>Diary Schedule - ${formattedDate}</title>
          <style>
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
              .page-break { page-break-before: always; }
            }
            
            body { 
              font-family: 'Georgia', 'Times New Roman', serif; 
              margin: 20px; 
              line-height: 1.6; 
              color: #333;
              background: #fff;
            }
            
            .letterhead {
              text-align: center;
              border-bottom: 3px solid #2563eb;
              padding-bottom: 20px;
              margin-bottom: 30px;
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
              padding: 20px;
              border-radius: 8px;
            }
            
            .letterhead h1 {
              margin: 0;
              color: #1e40af;
              font-size: 2.2em;
              font-weight: bold;
              text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
            }
            
            .letterhead h2 {
              margin: 5px 0;
              color: #374151;
              font-size: 1.5em;
              font-weight: normal;
            }
            
            .letterhead .subtitle {
              color: #6b7280;
              font-style: italic;
              font-size: 1.1em;
            }
            
            .document-info {
              background: #f9fafb;
              padding: 15px;
              border-radius: 6px;
              margin-bottom: 25px;
              border-left: 4px solid #3b82f6;
            }
            
            .document-info table {
              width: 100%;
              border-collapse: collapse;
            }
            
            .document-info td {
              padding: 5px 10px;
              border-bottom: 1px solid #e5e7eb;
            }
            
            .document-info td:first-child {
              font-weight: bold;
              color: #374151;
              width: 30%;
            }
            
            .statistics {
              display: block;
              margin-bottom: 25px;
            }
            
            .stat-box {
              background: #f3f4f6;
              padding: 15px;
              border-radius: 6px;
              border: 1px solid #d1d5db;
              max-width: 400px;
              margin: 0 auto;
            }
            
            .stat-box h3 {
              margin: 0 0 10px 0;
              color: #1f2937;
              font-size: 1.1em;
              border-bottom: 2px solid #3b82f6;
              padding-bottom: 5px;
            }
            
            .stat-item {
              display: flex;
              justify-content: space-between;
              padding: 3px 0;
              border-bottom: 1px dotted #d1d5db;
            }
            
            .stat-item:last-child {
              border-bottom: none;
            }
            
            .cases-section {
              margin-top: 30px;
            }
            
            .section-header {
              background: #1e40af;
              color: white;
              padding: 12px 15px;
              margin: 0 0 20px 0;
              border-radius: 6px;
              font-size: 1.3em;
              font-weight: bold;
            }
            
            .case-item {
              margin: 15px 0;
              padding: 20px;
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              position: relative;
            }
            
            .case-item::before {
              content: '';
              position: absolute;
              left: 0;
              top: 0;
              bottom: 0;
              width: 4px;
              background: linear-gradient(to bottom, #3b82f6, #1d4ed8);
              border-radius: 4px 0 0 4px;
            }
            
            .case-number {
              font-weight: bold;
              color: #1e40af;
              font-size: 1.3em;
              margin-bottom: 10px;
              display: flex;
              align-items: center;
              gap: 10px;
            }
            
            .case-number::before {
              content: '■';
              font-size: 1.2em;
              color: #3b82f6;
            }
            
            .case-details {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 15px;
              margin-top: 15px;
            }
            
            .case-detail {
              display: flex;
              flex-direction: column;
            }
            
            .case-detail-label {
              font-weight: bold;
              color: #374151;
              font-size: 0.9em;
              margin-bottom: 3px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .case-detail-value {
              color: #1f2937;
              font-size: 1em;
              padding: 5px 8px;
              background: #f9fafb;
              border-radius: 4px;
              border: 1px solid #e5e7eb;
            }
            
            .case-type {
              background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
              color: #1e40af;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 0.9em;
              font-weight: bold;
              border: 1px solid #93c5fd;
            }
            
            .priority-high { background: #fef2f2; color: #dc2626; border-color: #fca5a5; }
            .priority-medium { background: #fff7ed; color: #ea580c; border-color: #fdba74; }
            .priority-low { background: #f0fdf4; color: #16a34a; border-color: #86efac; }
            
            .case-notes {
              margin-top: 15px;
              padding: 12px;
              background: #fffbeb;
              border-left: 4px solid #f59e0b;
              border-radius: 0 6px 6px 0;
            }
            
            .case-notes-label {
              font-weight: bold;
              color: #92400e;
              font-size: 0.9em;
              margin-bottom: 5px;
            }
            
            .case-notes-content {
              color: #78350f;
              font-style: italic;
              line-height: 1.5;
            }
            
            .footer {
              margin-top: 40px;
              padding: 20px;
              text-align: center;
              border-top: 2px solid #e5e7eb;
              background: #f9fafb;
              border-radius: 6px;
            }
            
            .footer p {
              margin: 5px 0;
              color: #6b7280;
            }
            
            .footer .system-info {
              font-weight: bold;
              color: #374151;
              font-size: 1.1em;
            }
            
            .page-number {
              position: fixed;
              bottom: 10px;
              right: 10px;
              background: #f3f4f6;
              padding: 5px 10px;
              border-radius: 4px;
              font-size: 0.8em;
              color: #6b7280;
            }
            
            @media print {
              .page-number { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="letterhead">
            <h1>Court Schedule</h1>
            <h2>${formattedDate}</h2>
            <p class="subtitle">Kilungu Law Court</p>
          </div>
          
          <div class="document-info">
            <table>
              <tr>
                <td>Court Date:</td>
                <td>${formattedDate}</td>
              </tr>
              <tr>
                <td>Total Cases:</td>
                <td>${cases.length} scheduled hearing${
      cases.length !== 1 ? "s" : ""
    }</td>
              </tr>
              <tr>
                <td>Generated:</td>
                <td>${generatedTime}</td>
              </tr>
              <tr>
                <td>System:</td>
                <td>Records & Tracking</td>
              </tr>
            </table>
          </div>
          
          <div class="statistics">
            <div class="stat-box">
              <h3>Case Types Distribution</h3>
              ${Object.entries(caseTypes)
                .map(
                  ([type, count]) =>
                    `<div class="stat-item">
                  <span>${type}</span>
                  <span><strong>${count}</strong></span>
                </div>`
                )
                .join("")}
            </div>
          </div>
          
          <div class="cases-section">
            <div class="section-header">
              Detailed Court Schedule
            </div>
            
            ${cases
              .map((file, index) => {
                return `
                <div class="case-item">
                  <div class="case-number">
                    ${index + 1}. ${file.case_number || "Untitled Case"}
                  </div>
                  
                  <div class="case-details">
                    <div class="case-detail">
                      <div class="case-detail-label">Case Type</div>
                      <div class="case-detail-value">
                        <span class="case-type">${
                          file.case_type || "General"
                        }</span>
                      </div>
                    </div>
                    
                    <div class="case-detail">
                      <div class="case-detail-label">Purpose</div>
                      <div class="case-detail-value">${
                        file.purpose || "Not specified"
                      }</div>
                    </div>
                    
                    <div class="case-detail">
                      <div class="case-detail-label">Scheduled Time</div>
                      <div class="case-detail-value">${new Date(
                        file.required_on
                      ).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}</div>
                    </div>
                  </div>
                  
                  ${
                    file.notes
                      ? `
                    <div class="case-notes">
                      <div class="case-notes-label">Additional Notes:</div>
                      <div class="case-notes-content">${file.notes}</div>
                    </div>
                  `
                      : ""
                  }
                </div>
              `;
              })
              .join("")}
          </div>
          
          <div class="footer">
            <p class="system-info">Records & Tracking - Kilungu Law Court</p>
            <p>Generated on ${generatedTime}</p>
            <p>This document contains confidential court information and should be handled accordingly.</p>
            <p>© ${new Date().getFullYear()} Kilungu Law Court</p>
          </div>
          
          <div class="page-number">Page 1 of 1</div>
        </body>
      </html>
    `;

    const win = window.open("", "_blank", "width=800,height=600");
    if (win) {
      win.document.write(printContent);
      win.document.close();

      // Add a small delay to ensure content is fully loaded before printing
      setTimeout(() => {
        win.print();
      }, 500);
    }
  }

  // Enhanced WhatsApp reminder with multiple options
  const sendReminders = (type: "whatsapp" | "sms" | "email" = "whatsapp") => {
    if (!matchingCases || matchingCases.length === 0) return;

    const formattedDate = new Date(selectedDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const casesList = matchingCases
      .map(
        (c, i) =>
          `${i + 1}. ${c.case_number || "Untitled"} - ${c.purpose || "N/A"} (${
            c.case_type || "N/A"
          })`
      )
      .join("\n");

    const message = `COURT SCHEDULE REMINDER\n\nDate: ${formattedDate}\nTotal Cases: ${matchingCases.length}\n\nSchedule:\n${casesList}\n\nRecords & Tracking System`;

    switch (type) {
      case "whatsapp":
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
          message
        )}`;
        window.open(whatsappUrl, "_blank");
        break;
      case "sms":
        const smsUrl = `sms:?body=${encodeURIComponent(message)}`;
        window.open(smsUrl, "_blank");
        break;
      case "email":
        const emailSubject = `Court Schedule Reminder - ${formattedDate}`;
        const emailBody = message.replace(/\*/g, "").replace(/_/g, "");
        const emailUrl = `mailto:?subject=${encodeURIComponent(
          emailSubject
        )}&body=${encodeURIComponent(emailBody)}`;
        window.open(emailUrl, "_blank");
        break;
    }
  };

  return (
    <>
      <div className="flex flex-col items-center space-y-6 p-6">
        {/* Enhanced Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
            <CalendarDays className="w-8 h-8 text-primary" />
            Court Schedule
          </h2>
          <p className="text-default-500">
            Manage court hearings and case schedules
          </p>
        </div>

        {/* Enhanced Calendar */}

        <Calendar
          aria-label="Court Schedule Calendar"
          isDateUnavailable={isDateUnavailable}
          value={selectedDate}
          onChange={setSelectedDate}
          // className="w-full"
        />
      </div>

      {/* Enhanced Cases Section */}
      <div className="p-6">
        <Card className="shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold">
                  {selectedDate
                    ? `Court Schedule for ${new Date(
                        selectedDate
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}`
                    : "Select a Date"}
                </h3>
              </div>
              {matchingCases?.length > 0 && (
                <Chip size="sm" variant="flat" color="primary">
                  {matchingCases.length}{" "}
                  {matchingCases.length === 1 ? "Case" : "Cases"}
                </Chip>
              )}
            </div>
          </CardHeader>

          <CardBody className="pt-0">
            {selectedDate ? (
              matchingCases?.length > 0 ? (
                <div className="space-y-4">
                  {/* Enhanced Action Buttons */}
                  <div className="flex flex-wrap gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                      <Share2 className="w-4 h-4" />
                      Quick Actions
                    </div>
                    <div className="flex flex-wrap gap-2 w-full">
                      {/* WhatsApp Reminder Dropdown */}
                      <Dropdown>
                        <DropdownTrigger>
                          <Button
                            color="success"
                            variant="solid"
                            startContent={<MessageCircle className="w-4 h-4" />}
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg"
                          >
                            Send Reminder
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu>
                          <DropdownItem
                            key="whatsapp"
                            startContent={<MessageCircle className="w-4 h-4" />}
                            onPress={() => sendReminders("whatsapp")}
                          >
                            WhatsApp
                          </DropdownItem>
                          <DropdownItem
                            key="sms"
                            startContent={<Phone className="w-4 h-4" />}
                            onPress={() => sendReminders("sms")}
                          >
                            SMS
                          </DropdownItem>
                          <DropdownItem
                            key="email"
                            startContent={<Mail className="w-4 h-4" />}
                            onPress={() => sendReminders("email")}
                          >
                            Email
                          </DropdownItem>
                        </DropdownMenu>
                      </Dropdown>

                      {/* Export to Excel */}
                      <Button
                        color="primary"
                        variant="solid"
                        startContent={<Download className="w-4 h-4" />}
                        onPress={() =>
                          exportCasesToExcel(matchingCases, selectedDate)
                        }
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg"
                      >
                        Export Excel
                      </Button>

                      {/* Print */}
                      <Button
                        color="secondary"
                        variant="solid"
                        startContent={<Printer className="w-4 h-4" />}
                        onPress={() => printCases(matchingCases, selectedDate)}
                        className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg"
                      >
                        Print Court Schedule
                      </Button>
                    </div>
                  </div>

                  <Divider />

                  {/* Enhanced Case List */}
                  <div className="space-y-3">
                    {matchingCases?.map((file, index) => (
                      <Card
                        key={index}
                        className="border border-default-200 dark:border-default-800 hover:shadow-lg transition-all duration-300 hover:border-primary/50"
                      >
                        <CardBody className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                                <span className="text-primary font-semibold text-sm">
                                  {index + 1}
                                </span>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-foreground">
                                    {file?.case_number || "Untitled Case"}
                                  </h4>
                                  <Chip
                                    size="sm"
                                    variant="flat"
                                    color="primary"
                                  >
                                    {file.case_type || "N/A"}
                                  </Chip>
                                </div>
                                <p className="text-sm text-default-600">
                                  {file.purpose || "No purpose specified"}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-default-500">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(
                                      file.required_on
                                    ).toLocaleTimeString()}
                                  </div>
                                  {/* {file.client && (
                                    <div className="flex items-center gap-1">
                                      <User className="w-3 h-3" />
                                      {file.client}
                                    </div>
                                  )} */}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="light"
                                color="primary"
                                onPress={() => {
                                  setFileID(file.file_id);
                                  onOpenChangeView();
                                }}
                              >
                                View Details
                              </Button>
                              <Dropdown>
                                <DropdownTrigger>
                                  <Button isIconOnly size="sm" variant="light">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownTrigger>
                                <DropdownMenu>
                                  <DropdownItem
                                    key="remind"
                                    startContent={<Bell className="w-4 h-4" />}
                                    onPress={() => sendReminders("whatsapp")}
                                  >
                                    Send Reminder
                                  </DropdownItem>
                                  <DropdownItem
                                    key="export"
                                    startContent={
                                      <Download className="w-4 h-4" />
                                    }
                                    onPress={() =>
                                      exportCasesToExcel([file], selectedDate)
                                    }
                                  >
                                    Export This Case
                                  </DropdownItem>
                                </DropdownMenu>
                              </Dropdown>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-default-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CalendarDays className="w-8 h-8 text-default-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-default-500 mb-2">
                    No hearings scheduled
                  </h3>
                  <p className="text-default-400">
                    No court cases found for this date.
                  </p>
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarDays className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Select a Date
                </h3>
                <p className="text-default-500">
                  Click on a date in the calendar to view scheduled hearings.
                </p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <ViewCaseFileModal
        file_id={fileID}
        isOpen={isOpenView}
        onOpenChange={onOpenChangeView}
      />
    </>
  );
}

export default function Diary() {
  const { authData } = useAuth();
  const breadcrumbs = [authData?.role, "Calendar"];
  return (
    <>
      <Card
        isBlurred
        className="rounded-none h-full w-full border-none bg-background/60 dark:bg-default-100/50 bg-[url('light-bg.png')]  dark:bg-[url('dark-bg.png')] bg-no-repeat bg-cover"
        shadow="sm"
      >
        <CardBody className="grid grid-cols-[1fr_3fr_1fr] h-dvh">
          {/* LEFT PANEL */}
          <LeftPanel />
          <div className="border-r-small border-divider">
            {/* Navbar Section */}
            <NavbarSection breadcrumbs={breadcrumbs} />

            {/* Calendar */}
            <div className="p-2">
              <CalendarItem />
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div>
            <RightPanel />
          </div>
        </CardBody>
      </Card>
    </>
  );
}
