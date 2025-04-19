import {
  addToast,
  Button,
  Card,
  CardBody,
  CardFooter,
  Spinner,
} from "@heroui/react";
import { LucideTrash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { createNotification } from "../services/notifications";
import { deleteStaff } from "../services/staff";
import { deleteUser } from "../services/users";
import CustomModal from "./modal";
import { staff as staffImport } from "./staff_data";
export default function DeleteStaffMemberModal({
  staff_id,
  isOpen,
  onOpenChange,
}: {
  staff_id: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [staffData, setStaffData] = useState<any>(null);
  const [user_id, setUserId] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && staff_id) {
      fetchStaffDetails();

      console.log("Staff ID: ", staff_id);
    }
  }, [isOpen, staff_id]);

  const fetchStaffDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const staff = staffImport.find((s) => s.staff_id === staff_id);
      // Get the User ID of the staff member
      const get_user_id = staff?.user_id;
      if (!staff) throw new Error("No staff member found.");
      setStaffData(staff);
      if (!get_user_id) throw new Error("No user found.");
      setUserId(get_user_id);
    } catch (err: any) {
      console.error("Error fetching staff:", err);
      setError(err.message || "Failed to fetch staff details.");
    } finally {
      setLoading(false);
    }
  };

  const proceedWithDeletion = async () => {
    setLoading(true);
    setError(null);

    try {
      // ✅ Delete Staff
      console.log("Deleting Staff ID:", staff_id);
      const staffResponse = await deleteStaff(staff_id);

      if (!staffResponse || staffResponse.error) {
        throw new Error(
          staffResponse?.error || "Failed to delete staff member."
        );
      }

      console.log("Deleted Staff Member:", staffResponse);

      addToast({
        title: "Success",
        description: "Staff member deleted successfully.",
        color: "success",
      });

      // ✅ Delete User
      console.log("Deleting User ID:", user_id);
      const userResponse = await deleteUser(user_id);

      if (!userResponse || userResponse.error) {
        throw new Error(userResponse?.error || "Failed to delete user.");
      }

      console.log("Deleted User:", userResponse);

      //   addToast({
      //     title: "Success",
      //     description: "User deleted successfully.",
      //     color: "success",
      //   });

      // Create a new notification
      let notification = createNotification(
        `Staff member deleted: ${staffData?.name}`,
        "Info",
        user_id // User ID can be passed here if needed
      );

      if (!notification) {
        console.error("Failed to create notification.");
      } else {
        console.log("Notification created:", notification);
      }

      // ✅ Close Modal
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error during deletion:", error);

      const errorMessage = error?.message || "An unexpected error occurred.";

      setError(errorMessage);

      addToast({
        title: "Error",
        description: errorMessage,
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title=" Are you sure you?"
    >
      {loading ? (
        <div className="flex justify-center items-center p-4">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : (
        staffData && (
          <Card className="p-0 space-y-4 shadow-none">
            <CardBody>
              <p className="text-sm">
                This action cannot be undone. All data associated with this
                staff member will be permanently deleted.
              </p>
            </CardBody>
            <CardFooter className="flex justify-end">
              <Button
                variant="faded"
                onPress={() => {
                  proceedWithDeletion();
                }}
              >
                <LucideTrash2 size={24} />
              </Button>
            </CardFooter>
          </Card>
        )
      )}
    </CustomModal>
  );
}
