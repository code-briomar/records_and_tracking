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
import { File, updateFile } from "../services/files";
import { createNotification } from "../services/notifications";
import { fetchFileData } from "./files_data";
import CustomModal from "./modal";
import RequiredOnDatePicker from "./required_on_date_picker";

export default function EditCaseFileForm({
  file_id,
  isOpen,
  caseFiles,
  setCaseFiles,
  onOpenChange,
}: {
  file_id: number;
  isOpen: boolean;
  caseFiles: File[];
  setCaseFiles: React.Dispatch<React.SetStateAction<File[]>>;
  onOpenChange: (open: boolean) => void;
  onOpen: () => void; // ✅ Now a function, correctly typed
}) {
  const [caseFile, setCaseFile] = useState<File>({} as File);

  useEffect(() => {
    const fetchCaseFile = async () => {
      try {
        let response: File | undefined = caseFiles.find(
          (c) => c.file_id === file_id
        );
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
  }, [file_id]);

  const handleSubmit = async (values: any, { resetForm }: any) => {
    try {
      console.log("Updating file values:", values);

      const payload = {
        file_id: caseFile.file_id, // assuming caseFile contains this
        case_number: values.case_number,
        case_type: values.case_type,
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

      // Create a new notification
      let notification = createNotification(
        `File '${values.case_number}' updated successfully.`,
        "Success"
      );
      if (!notification) {
        addToast({
          title: "Error",
          description: "Internal error. Please try again.",
          color: "danger",
          shouldShowTimeoutProgress: true,
        });
        return;
      }

      addToast({
        title: "Success",
        description: "File updated successfully.",
        color: "success",
        shouldShowTimeoutProgress: true,
      });

      try {
        const files = await fetchFileData();
        setCaseFiles(files); // Update the case files state with the new data
      } catch (error) {
        console.error("Error updating case file:", error);
        addToast({
          title: "Error",
          description: "Failed to update case file.",
          color: "danger",
        });
      }

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
        title={"...Editing Case File No: " + caseFile.case_number}
      >
        {!caseFile && (
          <div className="flex items-center justify-center h-full w-full">
            <p className="text-gray-500">Loading...</p>
          </div>
        )}
        {caseFile.current_location === "" && (
          <div className="flex items-center justify-center h-full w-full">
            <p className="text-gray-500">No current location provided.</p>
          </div>
        )}
        {caseFile && (
          <Formik
            initialValues={{
              case_number: caseFile.case_number || "",
              case_type: caseFile.case_type || "",
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
              case_type: Yup.string().required("Case type is required"),
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
            {({ errors }) => (
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

                {/* Case Type */}
                <div>
                  <Field name="case_type">
                    {({ field, form }: any) => (
                      <Select
                        label="Type of Case"
                        placeholder="Select a case type"
                        selectedKeys={[field.value]}
                        onSelectionChange={(keys) =>
                          form.setFieldValue(field.name, Array.from(keys)[0])
                        }
                        variant="bordered"
                      >
                        <SelectItem key="Civil">Civil</SelectItem>
                        <SelectItem key="Criminal">Criminal</SelectItem>
                        <SelectItem key="Succession">Succession</SelectItem>
                        <SelectItem key="Children">Children</SelectItem>
                        <SelectItem key="Other">Other</SelectItem>
                      </Select>
                    )}
                  </Field>
                  <ErrorMessage
                    name="case_type"
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
                        <SelectItem key="Mention">Mention</SelectItem>
                        <SelectItem key="Hearing">Hearing</SelectItem>
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
                  {/* <Field
                    as={Input}
                    type="datetime-local"
                    label="Required On"
                    name="required_on"
                    variant="bordered"
                  /> */}

                  <RequiredOnDatePicker />
                  {/* Uncaught Error: Invalid ISO 8601 date string: 2025-05-14T00:00:00.000Z */}
                  {/* <ErrorMessage
                    name="required_on"
                    component="p"
                    className="text-red-500 text-sm"
                  /> */}
                </div>

                {/* Errors */}
                {Object.keys(errors).length > 0 && (
                  <div className="text-red-500 text-sm">
                    <p>Please fix the following errors:</p>
                    <ul>
                      {Object.values(errors).map(
                        (error: any, index: number) => (
                          <li key={index}>{error}</li>
                        )
                      )}
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
        )}
      </CustomModal>
    </>
  );
}
