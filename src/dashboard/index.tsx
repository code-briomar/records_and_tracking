import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Tab,
  Tabs,
  addToast,
} from "@heroui/react";
import { ChevronDown, ChevronRight } from "lucide-react";
import React from "react";
import { fileSectionData } from "../components/files_data";
import { FilesProcessedChart } from "../components/files_processed_simple_chart";
import LeftPanel from "../components/left_panel";
import NavbarSection from "../components/navbar";
import RightPanel from "../components/right_panel";
import { SummaryCards } from "../components/summary_cards";

import {
  CalendarIcon,
  ClipboardDocumentIcon,
  FolderIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth_context";

export default function Dashboard() {
  const { authData } = useAuth();
  const breadcrumbs = [authData?.role, "Dashboard"];

  const [selected, setSelected] = React.useState("upcoming_cases");
  const [refreshKey, setRefreshKey] = React.useState(0);

  // Listen for offender creation events to refresh dashboard
  React.useEffect(() => {
    const handleOffenderEvent = (event: CustomEvent) => {
      console.log(
        `Dashboard: ${event.type} event received, refreshing data...`,
        event.detail
      );

      // Trigger a refresh by updating the refresh key
      setRefreshKey((prev) => prev + 1);

      // Show toast notification
      const eventTypeMap = {
        "offender-created": {
          message: "New offender added",
          color: "success" as const,
        },
        "offender-updated": {
          message: "Offender updated",
          color: "primary" as const,
        },
        "offender-deleted": {
          message: "Offender deleted",
          color: "warning" as const,
        },
      };

      const eventInfo = eventTypeMap[event.type as keyof typeof eventTypeMap];
      if (eventInfo) {
        addToast({
          title: "Dashboard Updated",
          description: eventInfo.message,
          color: eventInfo.color,
        });
      }

      // Here you can add specific data refresh logic if needed
      // For example, refetch any offender-related summary data
    };

    // Add event listeners for all offender events
    window.addEventListener(
      "offender-created",
      handleOffenderEvent as EventListener
    );
    window.addEventListener(
      "offender-updated",
      handleOffenderEvent as EventListener
    );
    window.addEventListener(
      "offender-deleted",
      handleOffenderEvent as EventListener
    );

    // Cleanup on unmount
    return () => {
      window.removeEventListener(
        "offender-created",
        handleOffenderEvent as EventListener
      );
      window.removeEventListener(
        "offender-updated",
        handleOffenderEvent as EventListener
      );
      window.removeEventListener(
        "offender-deleted",
        handleOffenderEvent as EventListener
      );
    };
  }, []);

  // const this_week_date_range = {
  //   start: new Date(
  //     new Date().setDate(new Date().getDate() - 7)
  //   ).toLocaleDateString("en-US", {
  //     month: "2-digit",
  //     day: "2-digit",
  //     year: "numeric",
  //   }),
  //   end: new Date().toLocaleDateString("en-US", {
  //     month: "2-digit",
  //     day: "2-digit",
  //     year: "numeric",
  //   }),
  // };

  const today = new Date().toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });

  const todayFiles = fileSectionData.filter((file) => {
    const requiredOnDate = new Date(file.required_on).toLocaleDateString(
      "en-US",
      {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      }
    );
    return requiredOnDate === today;
  });

  const navigate = useNavigate();

  return (
    <>
      <Card
        className="rounded-none h-full w-full border-none bg-background/60 dark:bg-default-100/50 bg-[url('light-bg.png')]  dark:bg-[url('dark-bg.png')] bg-no-repeat bg-cover"
        shadow="sm"
      >
        <CardBody className="grid grid-cols-[1fr_3fr_1fr] h-dvh">
          {/* LEFT PANEL */}
          <LeftPanel />
          <div className="border-r-small border-divider">
            {/* Navbar Section */}
            <NavbarSection breadcrumbs={breadcrumbs} />

            {/* Main Content */}
            <Tabs
              aria-label="Options"
              selectedKey={
                authData?.role == "Super Admin"
                  ? "upcoming_cases"
                  : authData?.role === "Staff"
                  ? "staff_directory"
                  : selected
              }
              onSelectionChange={(key) => setSelected(key as string)}
              className="p-2"
            >
              {authData?.role == "Super Admin" ||
              authData?.role === "Court Admin" ? (
                <>
                  <Tab key="upcoming_cases" title={`Upcoming Cases`}>
                    <Card>
                      <CardHeader className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FolderIcon className="w-5 h-5 text-blue-500" />
                          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                            Today's Cases
                          </h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            {/* Today */}
                            {new Date().toLocaleDateString("en-US", {
                              month: "2-digit",
                              day: "2-digit",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </CardHeader>
                      <CardBody>
                        {todayFiles.length > 0 ? (
                          todayFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-4 mb-4"
                            >
                              {/* File Section Data Interface */}
                              {/* export interface File {
                            case_number?: any;
                            file_id: number;
                            caseNumber: string
                            purpose: string;
                            uploaded_by: number;
                            current_location: string;
                            notes: string;
                            date_recieved: string;
                            required_on: string;
                            required_on_signature: string;
                            date_returned: string | null;
                            date_returned_signature: string | null;
                            deleted: boolean;
                        } */}
                              <Card
                                key={file.file_id}
                                className="flex-1 p-4 bg-white dark:bg-background/50 rounded-lg shadow-md"
                                shadow="sm"
                              >
                                <CardBody>
                                  <div className="text-base text-gray-600 dark:text-gray-400 space-y-1 ml-6">
                                    <p className="flex items-center gap-1">
                                      <ClipboardDocumentIcon className="w-4 h-4 text-purple-500" />
                                      <span className="font-medium">
                                        Purpose:
                                      </span>{" "}
                                      {file.purpose}
                                    </p>

                                    {/* <p className="flex items-center gap-1">
                                    <PencilIcon className="w-4 h-4 text-yellow-500" />
                                    <span className="font-medium">Notes:</span>{" "}
                                    {file.notes || "—"}
                                  </p> */}

                                    <p className="flex items-center gap-1">
                                      <CalendarIcon className="w-4 h-4 text-gray-500" />
                                      <span className="font-medium">
                                        Date Received:
                                      </span>{" "}
                                      {new Date(
                                        file.date_recieved
                                      ).toLocaleDateString("en-US", {
                                        month: "2-digit",
                                        day: "2-digit",
                                        year: "numeric",
                                      })}
                                    </p>

                                    <p className="flex items-center gap-1">
                                      <CalendarIcon className="w-4 h-4 text-blue-500" />
                                      <span className="font-medium">
                                        Required On:
                                      </span>{" "}
                                      {new Date(
                                        file.required_on
                                      ).toLocaleDateString("en-US", {
                                        month: "2-digit",
                                        day: "2-digit",
                                        year: "numeric",
                                      })}
                                    </p>

                                    {/* <p className="flex items-center gap-1">
                                    <UserIcon className="w-4 h-4 text-teal-500" />
                                    <span className="font-medium">
                                      Signature Due:
                                    </span>{" "}
                                    {file.required_on_signature}
                                  </p> */}

                                    <p className="flex items-center gap-1">
                                      <CalendarIcon className="w-4 h-4 text-gray-500" />
                                      <span className="font-medium">
                                        Date Returned:
                                      </span>{" "}
                                      {file.date_returned || "—"}
                                    </p>

                                    <p className="flex items-center gap-1">
                                      <MapPinIcon className="w-4 h-4 text-green-500" />
                                      <span className="font-medium">
                                        Current File Location:
                                      </span>{" "}
                                      {file.current_location}
                                    </p>

                                    {/* <p className="flex items-center gap-1">
                                    <UserIcon className="w-4 h-4 text-teal-500" />
                                    <span className="font-medium">
                                      Return Signature:
                                    </span>{" "}
                                    {file.date_returned_signature || "—"}
                                  </p> */}

                                    {/* <p className="flex items-center gap-1">
                                    {file.deleted ? (
                                      <XCircleIcon className="w-4 h-4 text-red-500" />
                                    ) : (
                                      <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                    )}
                                    <span className="font-medium">
                                      Deleted:
                                    </span>{" "}
                                    {file.deleted ? "Yes" : "No"}
                                  </p> */}
                                    <div className="flex justify-end">
                                      <Button
                                        variant="faded"
                                        color="primary"
                                        onPress={() => navigate("/cts")}
                                      >
                                        View
                                        <ChevronRight className="w-5 h-5" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardBody>
                              </Card>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center justify-center gap-4 mb-4 w-full">
                            <h4>No Case Files Today</h4>
                          </div>
                        )}
                      </CardBody>
                    </Card>
                  </Tab>
                  <Tab key="summaries" title="Summaries" disabled>
                    {/* Today's Summaries Section */}
                    <div className="p-5">
                      <div className="flex items-center">
                        <h3 className="text-md">Today</h3>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                      <SummaryCards key={refreshKey} />
                    </div>

                    {/* Dashboard Charts */}
                    <div className="flex items-center justify-center">
                      <FilesProcessedChart />
                    </div>
                  </Tab>
                </>
              ) : null}
              {authData?.role === "Staff" && (
                <Tab
                  key="staff_directory"
                  title="Dashboard"
                  className="flex items-center justify-center"
                >
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 text-shadow-md">
                    Welcome to Kilungu Law Courts
                  </h1>
                </Tab>
              )}
            </Tabs>
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
