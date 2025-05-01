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
import { deleteFile, File } from "../services/files";
import { createNotification } from "../services/notifications";
// import { fileSectionData as caseFiles, fetchFileData } from "./files_data";
import { fetchFileData } from "./files_data";
import CustomModal from "./modal";
export default function DeleteCaseFileModal({
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
}) {
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && file_id) {
      fetchCaseDetails();

      console.log("Staff ID: ", file_id);
    }
  }, [isOpen, file_id]);

  const fetchCaseDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const caseFile = caseFiles.find((s) => s.file_id === file_id);
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
      console.log("Deleting Staff ID:", file_id);
      const caseResponse: any = await deleteFile(file_id);

      if (!caseResponse || caseResponse.error) {
        throw new Error(caseResponse?.error || "Failed to delete case file.");
      }

      console.log("Deleted Case File:", caseResponse);

      addToast({
        title: "Success",
        description: "Case File deleted successfully.",
        color: "success",
        shouldShowTimeoutProgress: true,
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
        const new_data: File[] | undefined = await fetchFileData();
        setCaseFiles(new_data);
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
