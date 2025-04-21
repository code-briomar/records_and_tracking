import { Button, Input } from "@heroui/react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import CustomModal from "./modal";

// ✅ Validation Schema for File Upload
const fileUploadSchema = Yup.object().shape({
  file_name: Yup.string().required("File name is required"),
  uploaded_by: Yup.number()
    .typeError("Uploaded by must be a valid user ID")
    .required("Uploaded by is required"),
  file_size: Yup.string().required("File size is required"),
  case_id: Yup.number().typeError("Case ID must be a number").nullable(),
  version: Yup.string().default("1.0"),
});

export default function AddNewFileForm({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  // const handleSubmit = async (values: any, { resetForm }: any) => {
  //   try {
  //     console.log("Uploading file:", values);

  //     // Upload file to backend
  //     const response = await addNewFile(
  //       values.file_name,
  //       parseInt(values.uploaded_by),
  //       values.file_size,
  //       values.case_id,
  //       values.version
  //     );

  //     if (!response || !response.file_id) {
  //       throw new Error("Failed to upload file. No file ID returned.");
  //     }

  //     addToast({
  //       title: "File Uploaded",
  //       description: `File '${values.file_name}' uploaded successfully.`,
  //       color: "success",
  //     });
  //     try {
  //       await fetchFileData();
  //     } catch (error) {
  //       console.error("Error refreshing staff data:", error);
  //     }
  //     console.log("File uploaded successfully:", response);

  //     // Create a new notification
  //     let notification = createNotification(
  //       `File '${values.file_name}' uploaded successfully.`,
  //       "Success",
  //       undefined
  //     );

  //     if (!notification) {
  //       console.error("Failed to create notification.");
  //     } else {
  //       console.log("Notification created:", notification);
  //     }

  //     // Reset form after successful upload
  //     resetForm();
  //     onOpenChange(false);
  //   } catch (error: any) {
  //     console.error("Error uploading file:", error.message || error);

  //     addToast({
  //       title: "Error",
  //       description: error.message || "An unexpected error occurred.",
  //       color: "danger",
  //     });
  //   }
  // };

  const handleSubmit = async (values: any, { resetForm }: any) => {
    console.log("Uploading file:", values);
  };
  return (
    <>
      <CustomModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title="Upload New File"
      >
        <Formik
          initialValues={{
            file_name: "",
            uploaded_by: "",
            file_size: "",
            case_id: "",
            version: "1.0",
          }}
          validationSchema={fileUploadSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isValid, dirty }) => (
            <Form className="flex flex-col gap-4">
              <div>
                <Field as={Input} label="File Name" name="file_name" />
                <ErrorMessage
                  name="file_name"
                  component="p"
                  className="text-red-500 text-sm"
                />
              </div>

              <div>
                <Field
                  as={Input}
                  label="Uploaded By (User ID)"
                  name="uploaded_by"
                  color={
                    errors.uploaded_by && touched.uploaded_by
                      ? "danger"
                      : "default"
                  }
                  placeholder="Enter uploader's user ID"
                />
                <ErrorMessage
                  name="uploaded_by"
                  component="p"
                  className="text-red-500 text-sm"
                />
              </div>

              <div>
                <Field
                  as={Input}
                  label="File Size"
                  name="file_size"
                  color={
                    errors.file_size && touched.file_size ? "danger" : "default"
                  }
                  placeholder="Enter file size (e.g., 2MB)"
                />
                <ErrorMessage
                  name="file_size"
                  component="p"
                  className="text-red-500 text-sm"
                />
              </div>

              <div>
                <Field
                  as={Input}
                  label="Case ID (Optional)"
                  name="case_id"
                  color={
                    errors.case_id && touched.case_id ? "danger" : "default"
                  }
                  placeholder="Enter case ID (if applicable)"
                />
                <ErrorMessage
                  name="case_id"
                  component="p"
                  className="text-red-500 text-sm"
                />
              </div>

              <div>
                <Field
                  as={Input}
                  label="File Version"
                  name="version"
                  placeholder="Enter version (e.g., 1.0)"
                  color={
                    errors.version && touched.version ? "danger" : "default"
                  }
                />
                <ErrorMessage
                  name="version"
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
                  Upload
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </CustomModal>
    </>
  );
}
