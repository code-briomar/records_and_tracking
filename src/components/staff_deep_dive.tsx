import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Radio,
  RadioGroup,
  Tab,
  Tabs,
  Textarea,
} from "@heroui/react";
import { PlusIcon } from "lucide-react";
import LeaveTypeDropdown from "./leave_type_dropdown";
import StaffAutoCompleteInput from "./staff_autocomplete_input";
import StaffReport from "./staff_report";
import StaffTable from "./staff_table";
const staffData = [
  {
    name: "Chung Miller",
    role: "Software Engineer",
    department: "IT Department",
    email: "chung.miller@example.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
  },
  {
    name: "Janelle Lenard",
    role: "HR Manager",
    department: "Human Resources",
    email: "janelle.lenard@example.com",
    avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
  },
  {
    name: "Zoey Lang",
    role: "Project Manager",
    department: "Operations",
    email: "zoey.lang@example.com",
    avatar: "https://i.pravatar.cc/150?u=a04258114e29026702d",
  },
];

export default function StaffDeepDive() {
  return (
    <div className="flex w-full flex-col">
      <h1 className="py-4 text-3xl">Staff Members</h1>
      <Tabs aria-label="Options">
        <Tab key="All" title="All">
          <StaffTable />
        </Tab>
        <Tab key="record_absence" title="Record Absence">
          <Card isBlurred>
            <CardHeader className="text-xl underline underline-offset-[8px]">
              Approve and Record Staff Absence
            </CardHeader>
            <CardBody className="flex flex-col space-y-6 items-start">
              {/* Search staff member */}
              <StaffAutoCompleteInput />
              {/* Enter reason */}
              <Textarea
                className="max-w-xs"
                description="Enter a concise reason"
                label="Description"
                placeholder="Enter staff member's reason"
                variant="faded"
              />
              {/* Leave Type */}
              <LeaveTypeDropdown />
              {/* Half Day or Full Day */}
              <RadioGroup color="warning" label="Half Day or Full Day?">
                <Radio description="Absent till tomorrow" value="buenos-aires">
                  Full Day
                </Radio>
                <Radio description="Absent until 1pm" value="canberra">
                  Half Day
                </Radio>
              </RadioGroup>

              {/* Enter comment */}
              <Textarea
                className="max-w-xs"
                description="Comments (optional)"
                label="Comments"
                placeholder="Any other comments?"
                variant="faded"
              />
            </CardBody>
            <CardFooter>
              <Button color="success">Submit</Button>
            </CardFooter>
          </Card>
        </Tab>
        <Tab key="staff_profiles" title="Staff Profiles">
          <div className="flex justify-end items-center my-2">
            <Button
              className="bg-foreground text-background"
              endContent={<PlusIcon />}
              size="sm"
            >
              Add New
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {staffData.map((staff, index) => (
              <Card key={index} className="p-4 shadow-md">
                <CardHeader className="flex items-center space-x-4">
                  <Avatar
                    isBordered
                    color="primary"
                    radius="lg"
                    src={staff.avatar}
                  />
                  <div>
                    <h3 className="text-lg font-semibold">{staff.name}</h3>
                    <p className="text-sm text-gray-500">{staff.role}</p>
                  </div>
                </CardHeader>
                <CardBody>
                  <p className="text-gray-700">{staff.department}</p>
                  <p className="text-gray-500 text-sm">{staff.email}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </Tab>

        <Tab key="reports_and_analytics" title="Reports & Analytics">
          <StaffReport />
        </Tab>
      </Tabs>
    </div>
  );
}
