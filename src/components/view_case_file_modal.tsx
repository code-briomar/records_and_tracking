import { Card, Spinner } from "@heroui/react";
import { useEffect, useState } from "react";
import { fileSectionData as caseFiles } from "./files_data";
import CustomModal from "./modal";
export default function ViewCaseFileModal({
  file_id,
  isOpen,
  onOpenChange,
}: {
  file_id: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [caseFileData, setCaseFileData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && file_id) {
      fetchCaseFileDetails();

      console.log("Staff ID: ", file_id);
    }
  }, [isOpen, file_id]);

  const fetchCaseFileDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const caseFile = caseFiles.find((s) => s.file_id == file_id);

      if (!caseFile) throw new Error("No case file found.");
      setCaseFileData(caseFile);

      console.log("Case File Data: ", caseFileData);
    } catch (err: any) {
      console.error("Error fetching case file:", err);
      setError(err.message || "Failed to fetch case file details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Case File Overview"
    >
      {loading ? (
        <div className="flex justify-center items-center p-4">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : (
        caseFileData && (
          <Card className="p-4 space-y-4 shadow-none rounded-lg">
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-lg text-gray-500 uppercase">
                    Case No.
                  </span>
                  <span className="font-medium ">
                    {caseFileData.case_number || "—"}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-lg text-gray-500 uppercase">For</span>
                  <span className="font-medium ">
                    {caseFileData.purpose || "—"}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-lg text-gray-500 uppercase">
                    Current Location
                  </span>
                  <span className="font-medium ">
                    {caseFileData.current_location || "—"}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-lg text-gray-500">On</span>
                  <span className="font-medium ">
                    {caseFileData.required_on
                      ? new Date(caseFileData.required_on).toLocaleDateString(
                          "en-US",
                          {
                            day: "numeric",
                            month: "numeric",
                            year: "numeric",
                          }
                        )
                      : "—"}
                  </span>
                </div>

                <div className="flex flex-col sm:col-span-2">
                  <span className="text-lg text-gray-500 uppercase">
                    Date Returned
                  </span>
                  <span className="font-medium ">
                    {caseFileData.date_returned
                      ? new Date(caseFileData.date_returned).toLocaleDateString(
                          "en-US",
                          {
                            day: "numeric",
                            month: "numeric",
                            year: "numeric",
                          }
                        )
                      : "—"}
                  </span>
                </div>

                <div className="flex flex-col sm:col-span-2">
                  <span className="text-lg text-gray-500">Notes</span>
                  <span className="font-medium ">
                    {caseFileData.notes || "—"}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )
      )}
    </CustomModal>
  );
}
