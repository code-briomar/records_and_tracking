import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Radio,
  RadioGroup,
  Tab,
  Tabs,
  Textarea,
} from "@heroui/react";
import { ErrorMessage, Form, Formik } from "formik";
import * as Yup from "yup";
import { createAttendance } from "../services/attendance";
import { updateStaff } from "../services/staff";
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
  const validationSchema = Yup.object().shape({
    staffMember: Yup.string().required("Staff member is required"),
    reason: Yup.string().required("Reason is required"),
    leaveType: Yup.string().required("Leave type is required"),
    leaveDuration: Yup.string().required("Please select half day or full day"),
    comments: Yup.string().optional(),
  });
  return (
    <div className="flex w-full flex-col">
      <h1 className="py-4 text-3xl">Staff Members</h1>
      <Tabs aria-label="Options">
        <Tab key="All" title="All">
          <StaffTable />
        </Tab>
        <Tab key="record_absence" title="Record Absence">
          <Card isBlurred>
            <CardBody className="flex flex-col space-y-6 items-center">
              <Formik
                initialValues={{
                  staffMember: "",
                  reason: "",
                  leaveType: "",
                  leaveDuration: "",
                  comments: "",
                }}
                validationSchema={validationSchema}
                onSubmit={async (values, { resetForm }) => {
                  console.log("Form Submitted:", values);

                  let response: any = await createAttendance({
                    staffId: parseInt(values?.staffMember),
                    date: new Date().toISOString(),
                    status: "Absent",
                    reason: values.reason,
                    halfDay: values.leaveDuration === "half-day",
                    comments: values.comments,
                  });

                  console.log("Response:", response);

                  response = await updateStaff(
                    parseInt(values?.staffMember),
                    "Absent"
                  );

                  console.log("Response:", response);
                  // TODO::Error Handling And Toast For Better UI Experience
                  resetForm();
                }}
              >
                {({ handleChange, handleBlur, values, isSubmitting }) => (
                  <Form>
                    <Card className="w-full px-6 shadow-none">
                      <CardHeader className="font-semibold text-xl underline underline-offset-[8px]">
                        Leave Request Form
                      </CardHeader>
                      <CardBody className="space-y-10">
                        {/* ✅ Staff Member Selection */}
                        <div>
                          <label className="font-medium">
                            Select Staff Member
                          </label>
                          <StaffAutoCompleteInput name="staffMember" />
                          <ErrorMessage
                            name="staffMember"
                            component="div"
                            className="text-red-500 text-sm mt-1"
                          />
                        </div>

                        {/* ✅ Reason Input */}
                        <Textarea
                          className="max-w-full"
                          description="Enter a concise reason"
                          label="Reason for Leave"
                          placeholder="Enter reason"
                          variant="faded"
                          name="reason"
                          value={values.reason}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                        <ErrorMessage
                          name="reason"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />

                        {/* ✅ Leave Type Dropdown */}
                        <div className="flex flex-col">
                          <label className="font-medium">Leave Type</label>
                          <LeaveTypeDropdown name="leaveType" />
                          <ErrorMessage
                            name="leaveType"
                            component="div"
                            className="text-red-500 text-sm mt-1"
                          />
                        </div>

                        {/* ✅ Half Day or Full Day */}
                        <RadioGroup
                          color="warning"
                          label="Half Day or Full Day?"
                          name="leaveDuration"
                          value={values.leaveDuration}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        >
                          <Radio
                            description="Absent till tomorrow"
                            value="full-day"
                          >
                            Full Day
                          </Radio>
                          <Radio
                            description="Absent until 1pm"
                            value="half-day"
                          >
                            Half Day
                          </Radio>
                        </RadioGroup>
                        <ErrorMessage
                          name="leaveDuration"
                          component="div"
                          className="text-red-500 text-sm mt-1"
                        />

                        {/* ✅ Comments (Optional) */}
                        <Textarea
                          className="max-w-full"
                          description="Additional Comments (Optional)"
                          label="Comments"
                          placeholder="Any other comments?"
                          variant="faded"
                          name="comments"
                          value={values.comments}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />

                        {/* ✅ Submit Button */}
                        <Button
                          type="submit"
                          color="success"
                          fullWidth
                          disabled={isSubmitting}
                        >
                          Submit Leave Request
                        </Button>
                      </CardBody>
                    </Card>
                  </Form>
                )}
              </Formik>
            </CardBody>
          </Card>
        </Tab>

        <Tab key="reports_and_analytics" title="Reports & Analytics">
          <StaffReport />
        </Tab>
      </Tabs>
    </div>
  );
}
