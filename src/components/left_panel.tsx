import { Accordion, AccordionItem, Button } from "@heroui/react";
import { File, FilePenLine, Link, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserDropdown } from "../components/user_dropdown";
const defaultContent =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";
const staffList = [
  {
    id: 1,
    name: "Chung Miller",
    color: "primary",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    subtitle: "4 unread reasons",
  },
  {
    id: 2,
    name: "Janelle Lenard",
    color: "success",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    subtitle: "3 incomplete steps",
  },
  {
    id: 3,
    name: "Zoey Lang",
    color: "warning",
    avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d",
    subtitle: (
      <p className="flex">
        2 issues to <span className="text-primary ml-1">fix now</span>
      </p>
    ),
  },
  {
    id: 4,
    name: "Alex Johnson",
    color: "danger",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026703d",
    subtitle: "5 pending approvals",
  },
  {
    id: 5, // This will trigger "See more"
    name: "Michael Smith",
    color: "secondary",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026705d",
    subtitle: "1 urgent task",
  },
];

const LeftPanel = () => {
  const navigate = useNavigate();
  const redirect = (path: string) => {
    console.log(path);

    navigate(path);
  };

  return (
    <div className="border-r-small border-divider p-2 space-y-4">
      {/* USER SECTION */}
      <div>
        <UserDropdown />
      </div>

      {/* Menu */}
      <div>
        <h1 className="m-2 text-gray-500 ">Dashbaord</h1>
        <Accordion variant="shadow">
          <AccordionItem
            key="1"
            aria-label="Dashboard"
            title="Dashboard"
            startContent={<UserRound className="w-4 h-4" />}
          >
            <div className="flex space-x-1 items-center ">
              <Button variant="faded" size="sm" onPress={() => redirect("/")}>
                Proceed
                <Link className="w-4 h-4" />
              </Button>
            </div>
          </AccordionItem>
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
                <Link className="w-4 h-4" />
              </Button>
            </div>
          </AccordionItem>
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
                <Link className="w-4 h-4" />
              </Button>
            </div>
          </AccordionItem>
          <AccordionItem
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
                <Link className="w-4 h-4" />
              </Button>
            </div>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Absent Staff */}
      <div>
        <h1 className="m-2 text-rose-500">Absent Staff</h1>
        <Accordion selectionMode="multiple">
          {staffList.slice(0, 4).map((staff) => (
            <AccordionItem
              key={staff.id}
              aria-label={staff.name}
              startContent={<UserRound />}
              subtitle={staff.subtitle}
              title={staff.name}
            >
              {defaultContent}
            </AccordionItem>
          ))}
        </Accordion>
        {staffList.length > 4 && (
          <div className="mt-2 text-blue-500 cursor-pointer hover:underline">
            <a href="/all-notifications">See more</a>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeftPanel;
