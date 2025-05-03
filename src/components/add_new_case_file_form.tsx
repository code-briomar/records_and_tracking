// import { addToast, Button, Input } from "@heroui/react";
// import { ErrorMessage, Field, Form, Formik } from "formik";
// import * as Yup from "yup";
// import { assignStaffToCase, createCase } from "../services/cases";
// import { createNotification } from "../services/notifications";
// import { fetchCasesData } from "./case_files_data";
// import CustomModal from "./modal";

// // Validation Schema
// const caseFileSchema = Yup.object().shape({
//   case_title: Yup.string().required("Full name is required"),
//   status: Yup.string().required("Status is required"),
//   assigned_staff: Yup.string().required("Assigned staff is required"),
//   priority: Yup.string().required("Priority is required"),
// });

// export default function AddNewCaseFileForm({
//   isOpen,
//   onOpenChange,
//   onOpen,
// }: {
//   isOpen: boolean;
//   onOpenChange: (open: boolean) => void;
//   onOpen: () => void; // ✅ Now a function, correctly typed
// }) {
//   const handleSubmit = async (values: any, { resetForm }: any) => {
//     try {
//       // Ensure assigned_staff is a number or null
//       const assignedStaff = values.assigned_staff
//         ? parseInt(values.assigned_staff, 10)
//         : undefined;

//       console.log("Submitting new case file:", values);

//       // Create Case
//       const response = await createCase(
//         values.case_title,
//         assignedStaff,
//         values.priority
//       );

//       if (!response || !response.case_id) {
//         throw new Error("Failed to create case. No case ID returned.");
//       }

//       addToast({
//         title: "Case Created",
//         description: `Case '${values.case_title}' created successfully.`,
//         color: "success",
//       });

//       console.log("Case created successfully:", response);

//       // Assign Staff if a staff member is selected
//       if (assignedStaff) {
//         const response_2 = await assignStaffToCase(
//           response.case_id,
//           assignedStaff
//         );

//         if (response_2.includes("Failed")) {
//           throw new Error("Failed to assign staff to case.");
//         }

//         addToast({
//           title: "Staff Assigned",
//           description: "Staff member successfully assigned to the case.",
//           color: "success",
//         });

//         console.log("Staff assigned successfully:", response_2);
//       }

//       // Create a new notification
//       let notification = createNotification(
//         `Case '${values.case_title}' created successfully.`,
//         "Success",
//         undefined
//       );

//       if (!notification) {
//         console.error("Failed to create notification.");
//       } else {
//         console.log("Notification created:", notification);
//       }

//       try {
//         await fetchCasesData();
//       } catch (error) {
//         console.error("Error refreshing staff data:", error);
//       }

//       // Reset form after successful submission
//       resetForm();
//       onOpenChange(false);
//     } catch (error: any) {
//       console.error("Error in handleSubmit:", error.message || error);

//       addToast({
//         title: "Error",
//         description: error.message || "An unexpected error occurred.",
//         color: "danger",
//       });
//     }
//   };

//   return (
//     <>
//       <CustomModal
//         isOpen={isOpen}
//         onOpenChange={onOpenChange}
//         title="Add New Case File"
//       >
//         <Formik
//           initialValues={{
//             case_title: "",
//             status: "",
//             assigned_staff: "",
//             priority: "",
//           }}
//           validationSchema={caseFileSchema}
//           onSubmit={handleSubmit}
//         >
//           {({ errors, touched, isValid, dirty }) => (
//             <Form className="flex flex-col gap-4">
//               <div>
//                 <Field as={Input} label="Case Title" name="case_title" />
//                 <ErrorMessage
//                   name="case_title"
//                   component="p"
//                   className="text-red-500 text-sm"
//                 />
//               </div>

//               <div>
//                 <Field
//                   as={Input}
//                   label="Status"
//                   name="status"
//                   placeholder="Enter status (e.g., Open)"
//                   color={errors.status && touched.status ? "danger" : "default"}
//                 />
//                 <ErrorMessage
//                   name="status"
//                   component="p"
//                   className="text-red-500 text-sm"
//                 />
//               </div>

//               <div>
//                 <Field
//                   as={Input}
//                   label="Assigned Staff"
//                   name="assigned_staff"
//                   color={
//                     errors.assigned_staff && touched.assigned_staff
//                       ? "danger"
//                       : "default"
//                   }
//                   placeholder="Enter assigned staff ID"
//                 />
//                 <ErrorMessage
//                   name="assigned_staff"
//                   component="p"
//                   className="text-red-500 text-sm"
//                 />
//               </div>

//               <div>
//                 <Field
//                   as={Input}
//                   label="Priority"
//                   name="priority"
//                   placeholder="Enter priority (e.g., High)"
//                   color={
//                     errors.priority && touched.priority ? "danger" : "default"
//                   }
//                 />
//                 <ErrorMessage
//                   name="priority"
//                   component="p"
//                   className="text-red-500 text-sm"
//                 />
//               </div>

//               {/* Buttons */}
//               <div className="flex justify-end gap-2 mt-4">
//                 <Button
//                   color="danger"
//                   variant="light"
//                   onPress={() => onOpenChange(false)}
//                 >
//                   Close
//                 </Button>
//                 <Button
//                   color="primary"
//                   type="submit"
//                   disabled={!(isValid && dirty)}
//                 >
//                   Submit
//                 </Button>
//               </div>
//             </Form>
//           )}
//         </Formik>
//       </CustomModal>
//     </>
//   );
// }

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
import { addNewFile, File } from "../services/files";
import { createNotification } from "../services/notifications";
import { fetchFileData } from "./files_data";
import CustomModal from "./modal";
import RequiredOnDatePicker from "./required_on_date_picker";

// Validation Schema
const fileSchema = Yup.object().shape({
  case_number: Yup.string().required("Case number is required"),
  case_type: Yup.string()
    .oneOf(["Civil", "Criminal", "Other"], "Invalid case type")
    .required("Case type is required"),
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
  setCaseFiles,
  onOpenChange,
}: {
  isOpen: boolean;
  setCaseFiles: React.Dispatch<React.SetStateAction<File[]>>;
  onOpenChange: (open: boolean) => void;
}) {
  const handleSubmit = async (values: any, { resetForm }: any) => {
    try {
      // SPECIAL REQUEST: In a day, there should be a maximum of 6 Criminal Cases

      const fileData = {
        ...values,
        caseNumber: values.case_number,
        caseType: values.case_type,
        uploaded_by: parseInt(values.uploaded_by, 10), // Ensure uploader ID is a number
        required_on: new Date(values.required_on), // Ensure correct timestamp format
      };

      console.log("Submitting new file:", fileData);

      const response = await addNewFile(fileData);

      if (!response || !response.file_id) {
        throw new Error("Failed to upload file. No file ID returned.");
      }

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
        title: "File Uploaded",
        description: `File for case '${values.case_number}' uploaded successfully.`,
        color: "success",
        shouldShowTimeoutProgress: true,
      });

      console.log("File uploaded successfully:", response);

      try {
        const files = await fetchFileData();
        setCaseFiles(files);
      } catch (error) {
        console.error("Error refreshing file data:", error);
      }

      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error in handleSubmit:", error.message || error);
      addToast({
        title: "Error",
        description: error || "An unexpected error occurred.",
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
          case_type: "",
          purpose: "",
          uploaded_by: 0, // Default to the first staff member TODO::Remove this in a future refactored version
          current_location: "",
          notes: "",
          required_on: "",
        }}
        validationSchema={fileSchema}
        onSubmit={handleSubmit}
      >
        {({ isValid, dirty, errors }) => (
          <Form className="flex flex-col gap-4">
            {(!isValid || !dirty) &&
              (() => {
                console.log("Form is not valid or dirty", errors);
                return null;
              })()}

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
              <Field name="case_type">
                {({ field, form }: any) => (
                  <Select
                    label="Type of Case"
                    placeholder="Select a case type"
                    selectedKeys={[field.value]}
                    onSelectionChange={(keys) =>
                      form.setFieldValue(field.name, Array.from(keys)[0])
                    }
                    className=""
                    variant={"bordered"}
                  >
                    <SelectItem key="Civil">Civil</SelectItem>
                    <SelectItem key="Criminal">Criminal</SelectItem>
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
                    <SelectItem key="Hearing">Hearing</SelectItem>
                    <SelectItem key="Mention">Mention</SelectItem>
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
