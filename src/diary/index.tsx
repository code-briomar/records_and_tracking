import { Calendar, Card, CardBody } from "@heroui/react";
import { isWeekend } from "@internationalized/date";
import { useLocale } from "@react-aria/i18n";
import { useState } from "react";
import { fileSectionData as caseFiles } from "../components/files_data";
import LeftPanel from "../components/left_panel";
import NavbarSection from "../components/navbar";
import RightPanel from "../components/right_panel";
import { useAuth } from "../context/auth_context";
// export interface File {
//     case_number?: any;
//     case_type?: any;
//     file_id: number;
//     caseNumber: string
//     caseType?: string;
//     purpose: string;
//     uploaded_by: number;
//     current_location: string;
//     notes: string;
//     date_recieved: string;
//     required_on: string;
//     required_on_signature: string;
//     date_returned: string | null;
//     date_returned_signature: string | null;
//     deleted: boolean;
// }

function CalendarItem() {
  const [selectedDate, setSelectedDate] = useState<any>(null);
  // let now = today(getLocalTimeZone());
  let { locale } = useLocale();

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
  const matchingCases = caseFiles.filter(
    (file) => selectedDate && file.required_on === selectedDate.toString()
  );

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
          matchingCases.length > 0 ? (
            <div className="list-disc ml-5 space-y-2">
              {matchingCases.map((file, index) => (
                <>
                  <div
                    key={index}
                    className="flex items-center space-x-2  p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md outline outline-1 rounded-md outline-gray-300 dark:outline-gray-600"
                  >
                    {/* Display the index of the case */}
                    <span className="text-sm text-gray-500">{++index}</span>
                    <span>{file.case_number || "Untitled Case"}</span>
                  </div>
                </>
              ))}
            </div>
          ) : (
            <p>No cases found for this date.</p>
          )
        ) : (
          <p>Click on a date to see cases.</p>
        )}
      </div>
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
        className="rounded-none h-full w-full border-none bg-background/60 dark:bg-default-100/50 bg-[url('public/light-bg.png')]  dark:bg-[url('public/dark-bg.png')] bg-no-repeat bg-cover"
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
