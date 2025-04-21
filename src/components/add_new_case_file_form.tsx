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
import * as Yup from "yup";
import { addNewFile } from "../services/files";
import { fetchFileData } from "./files_data";
import CustomModal from "./modal";
import RequiredOnDatePicker from "./required_on_date_picker";
import { staff } from "./staff_data";

// Validation Schema
const fileSchema = Yup.object().shape({
  case_number: Yup.string().required("Case number is required"),
  purpose: Yup.string()
    .oneOf(["Ruling", "Judgement", "Other"], "Invalid purpose")
    .required("Purpose is required"),
  uploaded_by: Yup.number().required("Uploader ID is required"),
  current_location: Yup.string().required("Current location is required"),
  notes: Yup.string().required("Notes are required"),
  required_on: Yup.date().required("Required date is required"),
});

export default function AddNewFileForm({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const handleSubmit = async (values: any, { resetForm }: any) => {
    try {
      const fileData = {
        ...values,
        caseNumber: values.case_number,
        uploaded_by: parseInt(values.uploaded_by, 10), // Ensure uploader ID is a number
        required_on: new Date(values.required_on), // Ensure correct timestamp format
      };

      console.log("Submitting new file:", fileData);

      const response = await addNewFile(fileData);

      if (!response || !response.file_id) {
        throw new Error("Failed to upload file. No file ID returned.");
      }

      addToast({
        title: "File Uploaded",
        description: `File for case '${values.case_number}' uploaded successfully.`,
        color: "success",
      });

      console.log("File uploaded successfully:", response);

      await fetchFileData(); // Fetch updated file data
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error in handleSubmit:", error.message || error);
      addToast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        color: "danger",
        shouldShowTimeoutProgress: true,
      });
    }
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Add New File"
    >
      <Formik
        initialValues={{
          case_number: "",
          purpose: "",
          uploaded_by: "",
          current_location: "",
          notes: "",
          required_on: "",
        }}
        validationSchema={fileSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, isValid, dirty }) => (
          <Form className="flex flex-col gap-4">
            <div>
              <Field
                as={Input}
                label="Case Number"
                name="case_number"
                variant={"bordered"}
                endContent={<Pen className="text-gray-500 m-2" />}
              />
              <ErrorMessage
                name="case_number"
                component="p"
                className="text-red-500 text-sm"
              />
            </div>

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
                    className=""
                    variant={"bordered"}
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

            <div>
              <Field name="uploaded_by">
                {({ field, form }: any) => (
                  <Select
                    key={field.value}
                    label="Uploaded By"
                    placeholder="Select staff member"
                    selectedKeys={[field.value]}
                    onSelectionChange={(keys) =>
                      form.setFieldValue(field.name, Array.from(keys)[0])
                    }
                    variant={"bordered"}
                  >
                    {staff.map((member) => (
                      <SelectItem key={member.staff_id}>
                        {member.name}
                      </SelectItem>
                    ))}
                    {/* <SelectItem key={member.id}>
                          {member.name} ({member.id})
                        </SelectItem> */}
                  </Select>
                )}
              </Field>
              <ErrorMessage
                name="purpose"
                component="p"
                className="text-red-500 text-sm"
              />
            </div>

            <div>
              <Field
                as={Input}
                label="Current Location"
                name="current_location"
                variant={"bordered"}
              />
              <ErrorMessage
                name="current_location"
                component="p"
                className="text-red-500 text-sm"
              />
            </div>

            <div>
              <Field
                as={Textarea}
                label="Notes"
                name="notes"
                placeholder="Add relevant notes"
                variant={"bordered"}
              />
              <ErrorMessage
                name="notes"
                component="p"
                className="text-red-500 text-sm"
              />
            </div>

            <div>
              <RequiredOnDatePicker />
            </div>

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
  );
}
