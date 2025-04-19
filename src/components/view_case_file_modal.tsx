import { Card, Spinner } from "@heroui/react";
import { useEffect, useState } from "react";
import { caseFiles } from "./case_files_data";
import CustomModal from "./modal";
export default function ViewCaseFileModal({
  case_id,
  isOpen,
  onOpenChange,
}: {
  case_id: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [caseFileData, setCaseFileData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && case_id) {
      fetchCaseFileDetails();

      console.log("Staff ID: ", case_id);
    }
  }, [isOpen, case_id]);

  const fetchCaseFileDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const caseFile = caseFiles.find((s) => s.case_id === case_id);
      if (!caseFile) throw new Error("No case file found.");
      setCaseFileData(caseFile);
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
      title="Case File Details"
    >
      {loading ? (
        <div className="flex justify-center items-center p-4">
          <Spinner size="lg" />
        </div>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : (
        caseFileData && (
          <Card className="p-2 space-y-4 shadow-none">
            {/* View Case File */}
            {/* const INITIAL_VISIBLE_COLUMNS = [ "case_id", "case_title", "status",
            "assigned_staff", "priority", "last_updated", "actions", ]; */}

            <table className="table-auto w-full border-collapse border border-gray-300">
              <tbody>
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Case ID
                  </th>
                  <td className="border border-gray-300 px-4 py-2">
                    {case_id}
                  </td>
                </tr>
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Assigned Staff
                  </th>
                  <td className="border border-gray-300 px-4 py-2">
                    {caseFileData.assigned_staff_id}
                  </td>
                </tr>
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Status
                  </th>
                  <td className="border border-gray-300 px-4 py-2">
                    {caseFileData.status}
                  </td>
                </tr>
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Priority
                  </th>
                  <td className="border border-gray-300 px-4 py-2">
                    {caseFileData.priority}
                  </td>
                </tr>
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Last Updated
                  </th>
                  <td className="border border-gray-300 px-4 py-2">
                    {new Date(caseFileData.date_created).toLocaleDateString(
                      "en-US"
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>
        )
      )}
    </CustomModal>
  );
}
