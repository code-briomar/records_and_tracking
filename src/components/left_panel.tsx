import {
  Accordion,
  AccordionItem,
  Avatar,
  Button,
  Card,
  CardBody,
  Chip,
} from "@heroui/react";
import {
  AlertTriangle,
  Badge,
  CalendarDays,
  Check,
  ChevronRight,
  FilePenLine,
  Fingerprint,
  Gauge,
  HelpCircle,
  Logs,
  Sparkles,
  UserRound,
  Users,
  Wrench,
} from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { UserDropdown } from "../components/user_dropdown";
import { useAuth } from "../context/auth_context";

const LeftPanel = () => {
  const { authData } = useAuth();
  const [absentStaff] = React.useState<any>([]);
  const navigate = useNavigate();

  // Early return if authData is not available yet
  if (!authData || !authData.user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const redirect = (path: string) => {
    console.log(path);
    navigate(path);
  };

  // useEffect(() => {
  //   const fetchAbsentStaff = async () => {
  //     try {
  //       // Simulate fetching staff data
  //       const response = staff.filter((staff) => staff.status == "Absent");
  //       setAbsentStaff(response);
  //     } catch (error) {
  //       console.error("Error fetching staff data:", error);
  //     }
  //   };

  //   fetchStaffData(); // Fetch all staff data on mount

  //   fetchAbsentStaff();
  // }, [staff]); // Empty dependency array to run only once on mount

  // const absentStaff = staff.filter((staff) => staff.status == "Absent");

  console.log("Absent Staff: ", absentStaff);

  return (
    <div className="border-r-small border-divider p-2 space-y-2">
      {/* USER SECTION */}
      <div>
        <UserDropdown />
      </div>

      {/* Menu */}
      <div>
        {/* Why Use This */}
        <div className="flex justify-end mt-6">
          <Button
            isIconOnly
            variant="light"
            aria-label="Why use this?"
            onPress={() => redirect("/why-use-this")}
            className="rounded-full"
          >
            <HelpCircle className="w-6 h-6 text-gray-500" />
          </Button>
        </div>
        <Accordion variant={"shadow"}>
          {/*Dashboard*/}
          <AccordionItem
            key="1"
            aria-label="Dashboard"
            title="Dashboard"
            startContent={<Gauge className="w-4 h-4" />}
          >
            <div className="flex space-x-1 items-center ">
              <Button
                variant="faded"
                size="sm"
                onPress={() => redirect("/dashboard")}
              >
                Proceed
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </AccordionItem>

          {/* Case Tracking System */}
          {authData.user.role === "Super Admin" ||
          authData.user.role === "Court Admin" ? (
            <AccordionItem
              key="2"
              aria-label="CTS"
              title="CTS"
              startContent={<FilePenLine />}
            >
              <div className="flex space-x-1 items-center ">
                <span className="text-xs">Track case files</span>
                <Button
                  variant="faded"
                  size="sm"
                  onPress={() => redirect("/cts")}
                >
                  Get Started
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </AccordionItem>
          ) : null}

          {/* Diary */}
          {/*TODO::Include In Future Release*/}
          <AccordionItem
            key="3"
            aria-label="Diary"
            title="Diary"
            startContent={<CalendarDays />}
          >
            <div className="flex space-x-1 items-center ">
              <span className="text-xs">View your court diary</span>
              <Button
                variant="faded"
                size="sm"
                onPress={() => redirect("/diary")}
              >
                Get Started
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </AccordionItem>

          {/* Offender Records */}
          <AccordionItem
            key="offenders"
            aria-label="Offender Records"
            title="Offender Records"
            startContent={<Fingerprint className="w-4 h-4" />}
          >
            <div className="flex space-x-1 items-center ">
              <span className="text-xs">Search and manage offenders</span>
              <Button
                variant="faded"
                size="sm"
                onPress={() => redirect("/offenders")}
              >
                Open
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </AccordionItem>

          {/* Staff */}
          {authData.user.role === "Super Admin" ? (
            <AccordionItem
              key="4"
              aria-label="Staff"
              title="Staff"
              startContent={<UserRound className="w-4 h-4" />}
            >
              <div className="flex space-x-1 items-center ">
                <span className="text-sm">Monitor Staff</span>
                <Button
                  variant="faded"
                  size="sm"
                  onPress={() => redirect("/staff")}
                >
                  Get Started
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </AccordionItem>
          ) : null}

          {/*Files*/}
          {/* <AccordionItem
            key="4"
            aria-label="Files"
            title="Files"
            startContent={<File />}
          >
            <div className="flex space-x-1 items-center ">
              <span className="text-xs">Monitor files</span>
              <Button
                variant="faded"
                size="sm"
                onPress={() => redirect("/files")}
              >
                Get Started
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </AccordionItem> */}

          {/*Audit Logs*/}
          {authData.user.role === "Super Admin" ? (
            <AccordionItem
              key="5"
              aria-label="Audit-Logs"
              title="Audit Logs"
              startContent={<Logs />}
            >
              <div className="flex flex-col space-y-1 items-start ">
                <span className="text-xs">Look at what's been happening</span>
                <Button
                  variant="faded"
                  size="sm"
                  onPress={() => redirect("/audit_logs")}
                >
                  Proceed
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </AccordionItem>
          ) : null}

          {/*Messaging*/}
          {/* <AccordionItem
            key="6"
            aria-label="Messaging"
            title="Messaging"
            startContent={<MessageCircleMore className={"text-green-500"} />}
          >
            <div className="flex flex-col space-y-1 items-start ">
              <span className="text-xs">Contact other users directly</span>
              <Button
                variant="faded"
                size="sm"
                onPress={() => redirect("/messaging")}
              >
                Get Started
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </AccordionItem> */}

          {/*AI Insights.....Don't Say It's AI*/}
          {/* <AccordionItem
            key="7"
            aria-label="AI"
            title="Insights"
            startContent={<Brain />}
          >
            <div className="flex space-x-1 items-center ">
              <span className="text-xs">View deep insights</span>
              <Button
                variant="faded"
                size="sm"
                onPress={() => redirect("/messaging")}
              >
                Get Started
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </AccordionItem> */}

          {/*Tools - Such as Scanned PDF to Word*/}
          {authData.user.role === "Super Admin" ||
          authData.user.role === "Court Admin" ? (
            <AccordionItem
              key="8"
              aria-label="Tools"
              title="Tools"
              startContent={<Wrench />}
            >
              <div className="flex space-x-1 items-center ">
                <span className="text-xs">Access Tools Here</span>
                <Button
                  variant="faded"
                  size="sm"
                  onPress={() => redirect("/tools")}
                >
                  Get Started
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </AccordionItem>
          ) : null}

          {/* <AccordionItem
            key="9"
            aria-label="Settings"
            title="Settings"
            startContent={<Cog className={"text-gray-600"} />}
          >
            <div className="flex space-x-1 items-center ">
              <span className="text-xs">Settings</span>
              <Button
                variant="faded"
                size="sm"
                onPress={() => redirect("/customize")}
              >
                Get Started
                <Link className="w-4 h-4" />
              </Button>
            </div>
          </AccordionItem> */}
        </Accordion>
      </div>

      {/* ABSENT STAFF SECTION */}
      {(authData.user.role === "Super Admin" ||
        authData.user.role === "Court Admin") && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Staff Status
            </h2>
            {absentStaff.length > 0 && (
              <Badge color="danger" size="sm">
                {absentStaff?.length}
              </Badge>
            )}
          </div>

          <Card
            className={`border ${
              absentStaff.length > 0
                ? "border-red-200 dark:border-red-800"
                : "border-green-200 dark:border-green-800"
            }`}
          >
            <CardBody className="p-3">
              {absentStaff.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium text-red-700 dark:text-red-300">
                      {absentStaff.length} Staff Member
                      {absentStaff.length > 1 ? "s" : ""} Absent
                    </span>
                  </div>

                  <div className="space-y-2">
                    {absentStaff.slice(0, 3).map((staff: any) => (
                      <div
                        key={staff.staff_id}
                        className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar
                            size="sm"
                            name={staff.name}
                            className="text-xs"
                          />
                          <div>
                            <div className="text-xs font-medium text-red-800 dark:text-red-200">
                              {staff.name}
                            </div>
                            <div className="text-xs text-red-600 dark:text-red-400">
                              {staff.role}
                            </div>
                          </div>
                        </div>
                        <Chip size="sm" color="danger" variant="flat">
                          Absent
                        </Chip>
                      </div>
                    ))}

                    {absentStaff.length > 3 && (
                      <Button
                        size="sm"
                        variant="light"
                        color="danger"
                        onPress={() => redirect("/staff")}
                        className="w-full text-xs"
                      >
                        View All ({absentStaff.length - 3} more)
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center space-y-2 flex-col">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      All Staff Present
                    </span>
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400">
                    Great attendance today!
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {/* QUICK ACTIONS */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Quick Actions
        </h2>

        <div className="grid grid-cols-2 gap-2">
          <Button
            size="sm"
            variant="flat"
            color="primary"
            onPress={() => redirect("/cts")}
            className="text-xs h-10"
            startContent={<FilePenLine className="w-3 h-3" />}
          >
            New Case
          </Button>
          <Button
            size="sm"
            variant="flat"
            color="secondary"
            onPress={() => redirect("/offenders")}
            className="text-xs h-10"
            startContent={<CalendarDays className="w-3 h-3" />}
          >
            Offenders
          </Button>
          {/* Court Diary */}
          <Button
            size="sm"
            variant="flat"
            color="success"
            onPress={() => redirect("/diary")}
            className="text-xs h-10"
            startContent={<CalendarDays className="w-3 h-3" />}
          >
            Court Diary
          </Button>
          {/* Export Data */}
          {authData.user.role === "Super Admin" && (
            <>
              <Button
                size="sm"
                variant="flat"
                color="warning"
                onPress={() => redirect("/tools")}
                className="text-xs h-10"
                startContent={<Wrench className="w-3 h-3" />}
              >
                Tools
              </Button>
              <Button
                size="sm"
                variant="flat"
                color="primary"
                onPress={() => redirect("/audit_logs")}
                className="text-xs h-10"
                startContent={<Logs className="w-3 h-3" />}
              >
                Audit Logs
              </Button>
            </>
          )}
          {authData.user.role === "Super Admin" && (
            <>
              <Button
                size="sm"
                variant="flat"
                color="success"
                onPress={() => redirect("/staff")}
                className="text-xs h-10"
                startContent={<UserRound className="w-3 h-3" />}
              >
                Add Staff
              </Button>
              <Button
                size="sm"
                variant="flat"
                color="warning"
                onPress={() => redirect("/tools")}
                className="text-xs h-10"
                startContent={<Wrench className="w-3 h-3" />}
              >
                Tools
              </Button>
            </>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
          <p>Kilungu Law Courts</p>
          <p>Records & Tracking System</p>
          <p className="mt-1">v1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default LeftPanel;
