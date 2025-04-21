import { addToast, Button, Input } from "@heroui/react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Yup from "yup";
import { createNotification } from "../services/notifications";
import { addStaff } from "../services/staff";
import { createUser } from "../services/users";
import CustomModal from "./modal";
import { fetchStaffData } from "./staff_data";

// Validation Schema
const staffSchema = Yup.object().shape({
  name: Yup.string().required("Full name is required"),
  email: Yup.string().email("Invalid email"),
  phone: Yup.string()
    .required("Phone number is required")
    .matches(/^\d+$/, "Phone number must be digits")
    .required("Phone number is required"),
  role: Yup.string().required("Role is required"),
});

export default function AddNewStaffMemberForm({
  isOpen,
  onOpenChange,
  onOpen,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onOpen: () => void; // ✅ Now a function, correctly typed
}) {
  const handleSubmit = async (values: any, { resetForm }: any) => {
    let userId;
    try {
      console.log("Submitting new staff:", values);

      try {
        userId = await createUser({
          name: values.name,
          role: values.role,
          email: values.email,
          phoneNumber: values.phone,
          passwordHash: "defaultpassword",
        });

        if (!userId) {
          throw new Error("Failed to create user. User ID is missing.");
        }
      } catch (error) {
        console.error("Error creating user:", error);
        addToast({
          title: "Error",
          description: "Failed to create user. Please try again.",
          color: "danger",
        });
        return;
      }

      let response;
      try {
        response = await addStaff(
          userId,
          values?.role || "Staff", // Ensure a valid string
          values?.phone,
          "Active"
        );

        if (!response || !(response as any).message) {
          throw new Error("Invalid response from addStaff");
        }
      } catch (error) {
        console.error("Error adding staff:", error);
        addToast({
          title: "Error",
          description: "Failed to add staff member. Please try again.",
          color: "danger",
        });
        return;
      }

      console.log("Response:", response);

      addToast({
        title: "Success",
        description:
          (response as any).message || "Staff member added successfully!",
        color: "success",
        shouldShowTimeoutProgress: true,
      });
      try {
        await fetchStaffData();
      } catch (error) {
        console.error("Error refreshing staff data:", error);
      }

      console.log("User ID:", userId);

      // Create a new notification
      let notification = createNotification(
        `New staff member added: ${values.name}`,
        "Info",
        userId
      );

      if (!notification) {
        console.error("Failed to create notification.");
      } else {
        console.log("Notification created:", notification);
      }

      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Unexpected error:", error);
      addToast({
        title: "Unexpected Error",
        description: "Something went wrong. Please try again later.",
        color: "danger",
      });
    }
  };

  return (
    <>
      <CustomModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title="Add New Staff"
      >
        <Formik
          initialValues={{ name: "", email: "", phone: "", role: "" }}
          validationSchema={staffSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isValid, dirty }) => (
            <Form className="flex flex-col gap-4">
              <div>
                <Field
                  as={Input}
                  label="Full Name"
                  name="name"
                  placeholder="Enter name"
                  color={errors.name && touched.name ? "danger" : "default"}
                />
                <ErrorMessage
                  name="name"
                  component="p"
                  className="text-red-500 text-sm"
                />
              </div>

              <div>
                <Field
                  as={Input}
                  label="Email Address"
                  type="email"
                  name="email"
                  placeholder="Enter email"
                  color={errors.email && touched.email ? "danger" : "default"}
                />
                <ErrorMessage
                  name="email"
                  component="p"
                  className="text-red-500 text-sm"
                />
              </div>

              <div>
                <Field
                  as={Input}
                  label="Phone Number"
                  type="tel"
                  name="phone"
                  placeholder="Enter phone number"
                  color={errors.phone && touched.phone ? "danger" : "default"}
                />
                <ErrorMessage
                  name="phone"
                  component="p"
                  className="text-red-500 text-sm"
                />
              </div>

              <div>
                <Field
                  as={Input}
                  label="Role"
                  name="role"
                  placeholder="Enter role (e.g., Clerk)"
                  color={errors.role && touched.role ? "danger" : "default"}
                />
                <ErrorMessage
                  name="role"
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
