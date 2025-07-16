import {
  Badge,
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
  User,
} from "lucide-react";
import { useState } from "react";
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

  // Enhanced export function with more professional formatting
  function exportCasesToCSV(cases: any[], date: any) {
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
      "Required On": new Date(c.required_on).toLocaleDateString(),
      Client: c.client || "N/A",
      Status: c.status || "Pending",
      Priority: c.priority || "Normal",
      Notes: c.notes || "No notes",
    }));

    const header = Object.keys(exportData[0]).join(",");
    const rows = exportData.map((row) => Object.values(row).join(","));
    const csv = [
      `"Legal Diary Export - ${formattedDate}"`,
      `"Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}"`,
      `"Total Cases: ${cases.length}"`,
      "",
      header,
      ...rows,
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `Legal_Diary_${date}_${cases.length}_Cases.csv`);
  }

  // Enhanced print function with professional formatting
  function printCases(cases: any[], date: any) {
    const formattedDate = new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const printContent = `
      <html>
        <head>
          <title>Legal Diary - ${formattedDate}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .case-item { margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
            .case-number { font-weight: bold; color: #0066cc; }
            .case-type { background: #f0f0f0; padding: 2px 8px; border-radius: 3px; font-size: 0.9em; }
            .footer { margin-top: 30px; text-align: center; font-size: 0.8em; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Legal Diary Schedule</h1>
            <h2>${formattedDate}</h2>
            <p>Total Cases: ${cases.length}</p>
          </div>
          ${cases
            .map(
              (file, index) => `
            <div class="case-item">
              <div class="case-number">${index + 1}. ${
                file.case_number || "Untitled Case"
              }</div>
              <div><strong>Type:</strong> <span class="case-type">${
                file.case_type || "N/A"
              }</span></div>
              <div><strong>Purpose:</strong> ${file.purpose || "N/A"}</div>
              <div><strong>Client:</strong> ${file.client || "N/A"}</div>
              <div><strong>Time:</strong> ${new Date(
                file.required_on
              ).toLocaleTimeString()}</div>
              ${
                file.notes
                  ? `<div><strong>Notes:</strong> ${file.notes}</div>`
                  : ""
              }
            </div>
          `
            )
            .join("")}
          <div class="footer">
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
            <p>Records & Tracking - Legal Case Management System</p>
          </div>
        </body>
      </html>
    `;

    const win = window.open("", "_blank");
    win?.document.write(printContent);
    win?.document.close();
    win?.print();
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

    const message = `🔔 *Legal Diary Reminder*\n\n📅 *Date:* ${formattedDate}\n📋 *Total Cases:* ${matchingCases.length}\n\n*Schedule:*\n${casesList}\n\n⚖️ _Records & Tracking System_`;

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
        const emailSubject = `Legal Diary Reminder - ${formattedDate}`;
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
            Legal Diary
          </h2>
          <p className="text-default-500">
            Schedule and manage your legal appointments
          </p>
        </div>

        {/* Enhanced Calendar */}

        <Calendar
          aria-label="Legal Diary Calendar"
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
                    ? `Cases for ${new Date(selectedDate).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}`
                    : "Select a Date"}
                </h3>
              </div>
              {matchingCases?.length > 0 && (
                <Badge
                  content={matchingCases.length}
                  color="primary"
                  variant="solid"
                >
                  <Chip size="sm" variant="flat" color="primary">
                    {matchingCases.length}{" "}
                    {matchingCases.length === 1 ? "Case" : "Cases"}
                  </Chip>
                </Badge>
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

                      {/* Export to CSV */}
                      <Button
                        color="primary"
                        variant="solid"
                        startContent={<Download className="w-4 h-4" />}
                        onPress={() =>
                          exportCasesToCSV(matchingCases, selectedDate)
                        }
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg"
                      >
                        Export CSV
                      </Button>

                      {/* Print */}
                      <Button
                        color="secondary"
                        variant="solid"
                        startContent={<Printer className="w-4 h-4" />}
                        onPress={() => printCases(matchingCases, selectedDate)}
                        className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg"
                      >
                        Print Schedule
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
                                  {file.client && (
                                    <div className="flex items-center gap-1">
                                      <User className="w-3 h-3" />
                                      {file.client}
                                    </div>
                                  )}
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
                                      exportCasesToCSV([file], selectedDate)
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
                    No cases scheduled
                  </h3>
                  <p className="text-default-400">
                    No cases found for this date.
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
                  Click on a date in the calendar to view scheduled cases.
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
