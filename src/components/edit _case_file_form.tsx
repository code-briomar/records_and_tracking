import {
  addToast,
  Button,
  Input,
  Select,
  SelectItem,
  Textarea,
} from "@heroui/react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { Pen } from "lucide-react";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import { updateFile } from "../services/files";
import { useFileStore } from "../store/useFileStore";
import CustomModal from "./modal";

// Validation Schema
const caseFileSchema = Yup.object().shape({
  case_title: Yup.string().required("Full name is required"),
  status: Yup.string().required("Status is required"),
  assigned_staff: Yup.string().required("Assigned staff is required"),
  priority: Yup.string().required("Priority is required"),
});

export default function EditCaseFileForm({
  file_id,
  isOpen,
  onOpenChange,
  onOpen,
}: {
  file_id: number;
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

  const { files: caseFiles, fetchFiles, loading } = useFileStore();

  useEffect(() => {
    const fetchCaseFile = async () => {
      try {
        let response = caseFiles.find((c) => c.file_id === file_id);
        if (response) {
          setCaseFile(response);
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
  }, [file_id, caseFiles]);

  useEffect(() => {
    fetchFiles(); // Fetch files when the component mounts
    if (!caseFiles.length) return;

    const response = caseFiles.find((c) => c.file_id === file_id);
    if (response) {
      setCaseFile(response);
    }
  }, [file_id, caseFiles]);

  const handleSubmit = async (values: any, { resetForm }: any) => {
    try {
      console.log("Updating file values:", values);

      const payload = {
        file_id: caseFile.file_id, // assuming caseFile contains this
        case_number: values.case_number,
        purpose: values.purpose,
        current_location: values.current_location,
        notes: values.notes,
        required_on: values.required_on,
      };

      const response = await updateFile(payload);

      if (!response || response.status !== "success") {
        addToast({
          title: "Error",
          description: "Failed to update file.",
          color: "danger",
        });
        return;
      }

      console.log("File updated successfully:", response);

      addToast({
        title: "Success",
        description: "File updated successfully.",
        color: "success",
      });

      fetchFiles(); // Fetch updated files list
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Error during file update:", error);
      addToast({
        title: "Error",
        description: "Something went wrong while updating.",
        color: "danger",
      });
    }
  };

  return (
    <>
      <CustomModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title={"Edit Case File No: " + caseFile.case_number}
      >
        <Formik
          initialValues={{
            case_number: caseFile.case_number || "",
            purpose: caseFile.purpose || "",
            uploaded_by: caseFile.uploaded_by || "",
            current_location: caseFile.current_location || "",
            notes: caseFile.notes || "",
            date_recieved: caseFile.date_recieved || "",
            required_on: caseFile.required_on || "",
            date_returned: caseFile.date_returned || "",
          }}
          validationSchema={Yup.object().shape({
            case_number: Yup.string().required("Case number is required"),
            purpose: Yup.string().required("Purpose is required"),
            current_location: Yup.string().required(
              "Current location is required"
            ),
            notes: Yup.string().required("Notes are required"),
            required_on: Yup.date()
              .required("Required date is required")
              .nullable(),
          })}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isValid, dirty, setFieldValue }) => (
            <Form className="flex flex-col gap-4">
              {/* Case Number */}
              <div>
                <Field
                  as={Input}
                  label="Case Number"
                  name="case_number"
                  variant="bordered"
                  endContent={<Pen className="text-gray-500 m-2" />}
                />
                <ErrorMessage
                  name="case_number"
                  component="p"
                  className="text-red-500 text-sm"
                />
              </div>

              {/* Purpose */}
              <div>
                <Field name="purpose">
                  {({ field, form }: any) => (
                    <Select
                      label="Purpose"
                      placeholder="Select a purpose"
                      selectedKeys={[field.value]}
                      onSelectionChange={(keys) =>
                        form.setFieldValue(field.name, Array.from(keys)[0])
                      }
                      variant="bordered"
                    >
                      <SelectItem key="Ruling">Ruling</SelectItem>
                      <SelectItem key="Judgement">Judgement</SelectItem>
                      <SelectItem key="Other">Other</SelectItem>
                    </Select>
                  )}
                </Field>
                <ErrorMessage
                  name="purpose"
                  component="p"
                  className="text-red-500 text-sm"
                />
              </div>

              {/* Current Location */}
              <div>
                <Field
                  as={Input}
                  label="Current Location"
                  name="current_location"
                  variant="bordered"
                />
                <ErrorMessage
                  name="current_location"
                  component="p"
                  className="text-red-500 text-sm"
                />
              </div>

              {/* Notes */}
              <div>
                <Field
                  as={Textarea}
                  label="Notes"
                  name="notes"
                  placeholder="Add relevant notes"
                  variant="bordered"
                />
                <ErrorMessage
                  name="notes"
                  component="p"
                  className="text-red-500 text-sm"
                />
              </div>

              {/* Required On */}
              <div>
                <Field
                  as={Input}
                  type="datetime-local"
                  label="Required On"
                  name="required_on"
                  variant="bordered"
                />
                <ErrorMessage
                  name="required_on"
                  component="p"
                  className="text-red-500 text-sm"
                />
              </div>

              {/* Errors */}
              {Object.keys(errors).length > 0 && (
                <div className="text-red-500 text-sm">
                  <p>Please fix the following errors:</p>
                  <ul>
                    {Object.values(errors).map((error: any, index: number) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

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
