import { Card, Spinner, User } from "@heroui/react";
import { useEffect, useState } from "react";
import CustomModal from "./modal";
import { staff as staffImport } from "./staff_data";
export default function StaffViewModal({
  staff_id,
  isOpen,
  onOpenChange,
}: {
  staff_id: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [staffData, setStaffData] = useState<any>(null);
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
      if (!staff) throw new Error("No staff member found.");
      setStaffData(staff);
    } catch (err: any) {
      console.error("Error fetching staff:", err);
      setError(err.message || "Failed to fetch staff details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Staff Details"
    >
      {loading ? (
        <div className="flex justify-center items-center p-4">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : (
        staffData && (
          <Card className="p-2 space-y-4 shadow-none">
            {/* <User
            avatarProps={{ radius: "full", size: "sm", src: "" }}
            classNames={{ description: "text-default-500" }}
            description={`Last updated: ${file.uploaded_by}`}
            name={cellValue}
          /> */}
            <User
              avatarProps={{
                radius: "full",
                size: "md",
                src: staffData.avatar,
              }}
              classNames={{ description: "text-default-500" }}
              description={`Role : ${staffData.role}`}
              name={staffData.name}
            />

            <h3 className="text-lg font-semibold">{staffData.name}</h3>
            <p>Email: {staffData.email || "N/A"}</p>
            <p>Phone: {staffData.phone_number || "N/A"}</p>
            <p>Status: {staffData.status}</p>
            {/* <div className="flex justify-end mt-4">
              <Button
                color="danger"
                variant="faded"
                onPress={() => onOpenChange(false)}
              >
                <X className="w-6 h-6">
              </Button>
            </div> */}
          </Card>
        )
      )}
    </CustomModal>
  );
}
