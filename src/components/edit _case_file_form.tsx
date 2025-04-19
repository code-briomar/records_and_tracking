import { addToast, Button, Input } from "@heroui/react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import { updateCaseStatus } from "../services/cases";
import { createNotification } from "../services/notifications";
import { caseFiles } from "./case_files_data";
import CustomModal from "./modal";

// Validation Schema
const caseFileSchema = Yup.object().shape({
  case_title: Yup.string().required("Full name is required"),
  status: Yup.string().required("Status is required"),
  assigned_staff: Yup.string().required("Assigned staff is required"),
  priority: Yup.string().required("Priority is required"),
});

export default function EditCaseFileForm({
  case_id,
  isOpen,
  onOpenChange,
  onOpen,
}: {
  case_id: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onOpen: () => void; // ✅ Now a function, correctly typed
}) {
  const [caseFile, setCaseFile] = useState<any>({
    case_title: "",
    status: "",
    assigned_staff: "",
    priority: "",
  });

  useEffect(() => {
    const fetchCaseFile = async () => {
      try {
        let response = caseFiles.find((c) => c.case_id === case_id);
        if (response) {
          setCaseFile((prev: any) => ({
            ...prev,
            case_title: response.title,
            status: response.status,
            assigned_staff: response.assigned_staff_id,
            priority: response.priority,
          }));
        }
      } catch (error) {
        console.error("Error fetching case file:", error);
        addToast({
          title: "Error",
          description: "Failed to fetch case file. Please try again.",
          color: "danger",
        });
      }
    };

    fetchCaseFile();

    console.log("Case File Data:", caseFile);
  }, [case_id]);

  const handleSubmit = async (values: any, { resetForm }: any) => {
    // Ensure assigned_staff is a number or null
    //   const assignedStaff = values.assigned_staff
    //     ? parseInt(values.assigned_staff, 10)
    //     : undefined;

    console.log("Updating old values to:", values);

    // Update Case Status
    const response: any = await updateCaseStatus(case_id, values.status);

    if (!response || response.error) {
      addToast({
        title: "Error",
        description: "Failed to update case status.",
        color: "danger",
      });
      throw new Error(response?.error || "Failed to update case.");
    }

    console.log("Case Status Updated Successfully:", response);

    addToast({
      title: "Success",
      description: "Case status updated successfully.",
      color: "success",
    });

    // Create a new notification
    let notification = createNotification(
      `Case '${values.case_title}' status updated to '${values.status}'.`,
      "Success",
      undefined
    );

    if (!notification) {
      console.error("Failed to create notification.");
    } else {
      console.log("Notification created:", notification);
    }

    resetForm();
    onOpenChange(false);
  };

  return (
    <>
      <CustomModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title={"Edit Case File No. " + case_id}
      >
        <Formik
          initialValues={{
            case_title: caseFile.case_title,
            status: caseFile.status,
            assigned_staff: caseFile.assigned_staff,
            priority: caseFile.priority,
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
                <Button color="primary" type="submit">
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
