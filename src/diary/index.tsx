import { Calendar, Card, CardBody, Link, useDisclosure } from "@heroui/react";
import { isWeekend } from "@internationalized/date";
import { useLocale } from "@react-aria/i18n";
import { saveAs } from "file-saver";
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

  function exportCasesToCSV(cases: any[], date: any) {
    if (!cases || cases.length === 0) return;
    const header = Object.keys(cases[0]).join(",");
    const rows = cases.map((c) => Object.values(c).join(","));
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    saveAs(blob, `cases_${date}.csv`);
  }

  function printCases(cases: any[], date: any) {
    const win = window.open("", "_blank");
    win?.document.write(
      `<h2>Cases for ${date}</h2><ul>${cases
        .map(
          (file: any) =>
            `<li>${file.case_number || "Untitled Case"} - ${file.purpose} - ${
              file.required_on
            }</li>`
        )
        .join("")}</ul>`
    );
    win?.print();
  }

  // Add WhatsApp/SMS reminder logic (simulate with a button for now)
  const sendReminders = () => {
    if (!matchingCases || matchingCases.length === 0) return;
    const message = `Reminder: You have ${matchingCases.length} case(s) scheduled for ${selectedDate}.`;
    // Simulate WhatsApp/SMS by opening WhatsApp Web with prefilled message
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    // For SMS, you could use: window.open(`sms:?body=${encodeURIComponent(message)}`);
  };

  return (
    <>
      <div className="flex items-center flex-col space-x-2 m-2">
        <h2 className="text-2xl">Diary</h2>
        <Calendar
          aria-label="Date (Unavailable)"
          isDateUnavailable={isDateUnavailable}
          value={selectedDate}
          onChange={setSelectedDate}
          // className=""
        />
      </div>

      {/* Section to Show Cases on That Day */}
      <div className="m-2">
        <h2 className="text-2xl mb-2">Cases</h2>
        {selectedDate ? (
          matchingCases?.length > 0 ? (
            <>
              <div className="flex gap-2 mb-2">
                <button
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                  onClick={sendReminders}
                >
                  Send WhatsApp Reminder
                </button>
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                  onClick={() => exportCasesToCSV(matchingCases, selectedDate)}
                >
                  Export to CSV
                </button>
                <button
                  className="bg-gray-700 text-white px-3 py-1 rounded text-sm"
                  onClick={() => printCases(matchingCases, selectedDate)}
                >
                  Print
                </button>
              </div>
              <div className="list-disc ml-5 space-y-2">
                {matchingCases?.map((file, index) => (
                  <>
                    <div
                      key={index}
                      className="flex items-center justify-between space-x-2  p-2 cursor-pointer rounded-md outline outline-1 rounded-md outline-gray-300 dark:outline-gray-600"
                    >
                      {/* Display the index of the case */}
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">{++index}</span>
                        <span>{file?.case_number || "Untitled Case"}</span>
                      </div>
                      <Link
                        href="javascript:void(0)"
                        underline="hover"
                        onPress={() => {
                          setFileID(file.file_id);
                          onOpenChangeView();
                        }}
                      >
                        View Details
                      </Link>
                    </div>
                  </>
                ))}
              </div>
            </>
          ) : (
            <p>No cases found for this date.</p>
          )
        ) : (
          <p>Click on a date to see cases.</p>
        )}
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
