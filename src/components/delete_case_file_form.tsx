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
import { deleteCase } from "../services/cases";
import { createNotification } from "../services/notifications";
import { caseFiles, fetchCasesData } from "./case_files_data";
import CustomModal from "./modal";
export default function DeleteCaseFileModal({
  case_id,
  isOpen,
  onOpenChange,
}: {
  case_id: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && case_id) {
      fetchCaseDetails();

      console.log("Staff ID: ", case_id);
    }
  }, [isOpen, case_id]);

  const fetchCaseDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const caseFile = caseFiles.find((s) => s.case_id === case_id);
      if (!caseFile) throw new Error("No case file found.");
      setCaseData(caseFile);
    } catch (err: any) {
      console.error("Error fetching case file:", err);
      setError(err.message || "Failed to fetch case file details.");
    } finally {
      setLoading(false);
    }
  };

  const proceedWithDeletion = async () => {
    setLoading(true);
    setError(null);

    try {
      // ✅ Delete Staff
      console.log("Deleting Staff ID:", case_id);
      const caseResponse: any = await deleteCase(case_id);

      if (!caseResponse || caseResponse.error) {
        throw new Error(caseResponse?.error || "Failed to delete case file.");
      }

      console.log("Deleted Case File:", caseResponse);

      addToast({
        title: "Success",
        description: "Case File deleted successfully.",
        color: "success",
      });

      //   addToast({
      //     title: "Success",
      //     description: "User deleted successfully.",
      //     color: "success",
      //   });

      // Create a new notification
      let notification = createNotification(
        `Case File '${caseData?.file_name}' deleted successfully.`,
        "Success",
        undefined
      );

      if (!notification) {
        console.error("Failed to create notification.");
      } else {
        console.log("Notification created:", notification);
      }

      try {
        await fetchCasesData();
      } catch (error) {
        console.error("Error refreshing staff data:", error);
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
        caseData && (
          <Card className="p-0 space-y-4 shadow-none">
            <CardBody>
              <p className="text-sm">
                This action cannot be undone. All data associated with this case
                file will be permanently deleted.
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
