import {
  addToast,
  Autocomplete,
  AutocompleteItem,
  Button,
  Input,
} from "@heroui/react";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import { createNotification } from "../services/notifications";
import { updateStaff } from "../services/staff";
import CustomModal from "./modal";
import { fetchStaffData, staff } from "./staff_data";

// Validation Schema
const staffSchema = Yup.object().shape({});

export default function EditStaffMemberForm({
  staff_id,
  isOpen,
  onOpenChange,
}: {
  staff_id: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onOpen: () => void; // ✅ Now a function, correctly typed
}) {
  const [staffMember, setStaffMember] = useState<{
    name: string;
    email: string;
    phone_number: string;
    role: string;
  } | null>({
    name: "",
    email: "",
    phone_number: "",
    role: "",
  });

  useEffect(() => {
    const fetchStaffMember = async () => {
      try {
        const response = staff.find((s) => s.staff_id === staff_id);
        if (response) {
          setStaffMember(response);
        }
      } catch (error) {
        console.error("Error fetching staff member:", error);
        addToast({
          title: "Error",
          description: "Failed to fetch staff member. Please try again.",
          color: "danger",
        });
      }
    };

    fetchStaffMember();

    console.log("Staff Data:", staff);
  }, [staff_id]);

  const handleSubmit = async (values: any, { resetForm }: any) => {
    try {
      console.log("Updating Staff ID:", staff_id, "with values:", values);

      const response = await updateStaff(staff_id, values.status);

      if (!response || response.error) {
        throw new Error(response?.error || "Failed to update staff.");
      }

      console.log("Staff Updated Successfully:", response);

      addToast({
        title: "Success",
        description: "Staff status updated successfully.",
        color: "success",
      });

      // Create a new notification
      // User ID
      1; // TODO:: Create Context and  Replace with the actual user ID if needed. Staff ID for now
      let notification = createNotification(
        `Staff member ${values.name} has been updated to ${values.status}.`,
        "Info",
        undefined
      );

      if (!notification) {
        console.error("Failed to create notification.");
      } else {
        console.log("Notification created:", notification);
      }

      // ✅ Refresh staff data
      await fetchStaffData();

      // ✅ Reset form after success
      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error updating staff:", error);

      addToast({
        title: "Error",
        description: error?.message || "An unexpected error occurred.",
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
          initialValues={{
            name: staffMember?.name,
            email: staffMember?.email,
            phone: staffMember?.phone_number,
            role: staffMember?.role,
            status: "",
          }}
          validationSchema={staffSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, setFieldValue }) => (
            <Form className="flex flex-col gap-4">
              <div>
                <Field
                  as={Input}
                  label="Full Name"
                  disabled
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
                  disabled
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
                  disabled
                />
                <ErrorMessage
                  name="phone"
                  component="p"
                  className="text-red-500 text-sm"
                />
              </div>

              {/* <div>
                <Field
                  as={Input}
                  label="Role"
                  name="role"
                  placeholder="Enter role (e.g., Clerk)"
                  color={errors.role && touched.role ? "danger" : "default"}
                  disabled
                />
                <ErrorMessage
                  name="role"
                  component="p"
                  className="text-red-500 text-sm"
                />
              </div> */}

              <div>
                <Autocomplete
                  className="w-full"
                  label="Status"
                  placeholder="Select status"
                  selectedKey={values.status} // Bind Formik value
                  onSelectionChange={(value) => setFieldValue("status", value)} // Update Formik state
                >
                  <AutocompleteItem key="Active">Active</AutocompleteItem>
                  <AutocompleteItem key="Absent">Absent</AutocompleteItem>
                </Autocomplete>

                <ErrorMessage
                  name="status"
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
                <Button color="primary" type="submit" disabled={!values.status}>
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
