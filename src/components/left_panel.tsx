import { Accordion, AccordionItem, Button } from "@heroui/react";
import {
  Brain,
  ChevronRight,
  Cog,
  FilePenLine,
  Gauge,
  Link,
  Logs,
  MessageCircleMore,
  UserRound,
  Wrench,
} from "lucide-react";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserDropdown } from "../components/user_dropdown";
import { fetchStaffData, staff } from "./staff_data";

const LeftPanel = () => {
  const [absentStaff, setAbsentStaff] = React.useState<any>([]);
  const navigate = useNavigate();
  const redirect = (path: string) => {
    console.log(path);

    navigate(path);
  };

  useEffect(() => {
    const fetchAbsentStaff = async () => {
      try {
        // Simulate fetching staff data
        const response = staff.filter((staff) => staff.status == "Absent");
        setAbsentStaff(response);
      } catch (error) {
        console.error("Error fetching staff data:", error);
      }
    };

    fetchStaffData(); // Fetch all staff data on mount

    fetchAbsentStaff();
  }, [staff]); // Empty dependency array to run only once on mount

  // const absentStaff = staff.filter((staff) => staff.status == "Absent");

  console.log("Absent Staff: ", absentStaff);

  return (
    <div className="border-r-small border-divider p-2 space-y-8">
      {/* USER SECTION */}
      <div>
        <UserDropdown />
      </div>

      {/* Menu */}
      <div>
        <Accordion variant="shadow">
          {/*Dashboard*/}
          <AccordionItem
            key="1"
            aria-label="Dashboard"
            title="Dashboard"
            startContent={<Gauge className="w-4 h-4" />}
          >
            <div className="flex space-x-1 items-center ">
              <Button variant="faded" size="sm" onPress={() => redirect("/")}>
                Proceed
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </AccordionItem>

          {/*Staff*/}
          <AccordionItem
            key="2"
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

          {/* CTS*/}
          {/*TODO::Include In Future Release*/}
          <AccordionItem
            key="3"
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

          {/*Messaging*/}
          <AccordionItem
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
          </AccordionItem>

          {/*AI Insights.....Don't Say It's AI*/}
          <AccordionItem
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
          </AccordionItem>

          {/*Tools - Such as Scanned PDF to Word*/}
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
                onPress={() => redirect("/messaging")}
              >
                Get Started
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </AccordionItem>

          <AccordionItem
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
          </AccordionItem>
        </Accordion>
      </div>

      {/* Absent Staff */}
      <div>
        <h1 className="m-2 text-rose-500">Absent Staff</h1>

        {absentStaff.length > 0 ? (
          <>
            {absentStaff.map((staff: any) => (
              // <AccordionItem
              //   key={staff.staff_id}
              //   aria-label={staff.name}
              //   startContent={<UserRound />}
              //   subtitle={staff.contact_number}
              //   title={staff.name}
              // >
              //   {defaultContent}
              // </AccordionItem>
              <div
                key={staff.staff_id}
                className="flex items-center justify-between p-2 border-b border-gray-200"
              >
                <div className="flex items-center space-x-2">
                  <UserRound className="w-4 h-4" />
                  <div className="text-sm font-semibold">{staff.name}</div>
                </div>
                {/* <div className="text-xs text-gray-500">{staff.status}</div> */}
              </div>
            ))}

            {absentStaff.length > 4 && (
              <div className="mt-2 text-blue-500 cursor-pointer hover:underline">
                <a href="/all-notifications">See more</a>
              </div>
            )}
          </>
        ) : (
          <p className="text-green-600 font-semibold">✅ Everyone is present</p>
        )}
      </div>
    </div>
  );
};

export default LeftPanel;
