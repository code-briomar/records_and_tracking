import { addToast, Button, Input } from "@heroui/react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { assignStaffToCase, createCase } from "../services/cases";
import { createNotification } from "../services/notifications";
import { fetchCasesData } from "./case_files_data";
import CustomModal from "./modal";

// Validation Schema
const caseFileSchema = Yup.object().shape({
  case_title: Yup.string().required("Full name is required"),
  status: Yup.string().required("Status is required"),
  assigned_staff: Yup.string().required("Assigned staff is required"),
  priority: Yup.string().required("Priority is required"),
});

export default function AddNewCaseFileForm({
  isOpen,
  onOpenChange,
  onOpen,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onOpen: () => void; // ✅ Now a function, correctly typed
}) {
  const handleSubmit = async (values: any, { resetForm }: any) => {
    try {
      // Ensure assigned_staff is a number or null
      const assignedStaff = values.assigned_staff
        ? parseInt(values.assigned_staff, 10)
        : undefined;

      console.log("Submitting new case file:", values);

      // Create Case
      const response = await createCase(
        values.case_title,
        assignedStaff,
        values.priority
      );

      if (!response || !response.case_id) {
        throw new Error("Failed to create case. No case ID returned.");
      }

      addToast({
        title: "Case Created",
        description: `Case '${values.case_title}' created successfully.`,
        color: "success",
      });

      console.log("Case created successfully:", response);

      // Assign Staff if a staff member is selected
      if (assignedStaff) {
        const response_2 = await assignStaffToCase(
          response.case_id,
          assignedStaff
        );

        if (response_2.includes("Failed")) {
          throw new Error("Failed to assign staff to case.");
        }

        addToast({
          title: "Staff Assigned",
          description: "Staff member successfully assigned to the case.",
          color: "success",
        });

        console.log("Staff assigned successfully:", response_2);
      }

      // Create a new notification
      let notification = createNotification(
        `Case '${values.case_title}' created successfully.`,
        "Success",
        undefined
      );

      if (!notification) {
        console.error("Failed to create notification.");
      } else {
        console.log("Notification created:", notification);
      }

      try {
        await fetchCasesData();
      } catch (error) {
        console.error("Error refreshing staff data:", error);
      }

      // Reset form after successful submission
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error in handleSubmit:", error.message || error);

      addToast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        color: "danger",
      });
    }
  };

  return (
    <>
      <CustomModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title="Add New Case File"
      >
        <Formik
          initialValues={{
            case_title: "",
            status: "",
            assigned_staff: "",
            priority: "",
          }}
          validationSchema={caseFileSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isValid, dirty }) => (
            <Form className="flex flex-col gap-4">
              <div>
                <Field as={Input} label="Case Title" name="case_title" />
                <ErrorMessage
                  name="case_title"
                  component="p"
                  className="text-red-500 text-sm"
                />
              </div>

              <div>
                <Field
                  as={Input}
                  label="Status"
                  name="status"
                  placeholder="Enter status (e.g., Open)"
                  color={errors.status && touched.status ? "danger" : "default"}
                />
                <ErrorMessage
                  name="status"
                  component="p"
                  className="text-red-500 text-sm"
                />
              </div>

              <div>
                <Field
                  as={Input}
                  label="Assigned Staff"
                  name="assigned_staff"
                  color={
                    errors.assigned_staff && touched.assigned_staff
                      ? "danger"
                      : "default"
                  }
                  placeholder="Enter assigned staff ID"
                />
                <ErrorMessage
                  name="assigned_staff"
                  component="p"
                  className="text-red-500 text-sm"
                />
              </div>

              <div>
                <Field
                  as={Input}
                  label="Priority"
                  name="priority"
                  placeholder="Enter priority (e.g., High)"
                  color={
                    errors.priority && touched.priority ? "danger" : "default"
                  }
                />
                <ErrorMessage
                  name="priority"
                  component="p"
                  className="text-red-500 text-sm"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  color="danger"
                  variant="light"
                  onPress={() => onOpenChange(false)}
                >
                  Close
                </Button>
                <Button
                  color="primary"
                  type="submit"
                  disabled={!(isValid && dirty)}
                >
                  Submit
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </CustomModal>
    </>
  );
}
