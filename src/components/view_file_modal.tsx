import { Card, Spinner } from "@heroui/react";
import { useEffect, useState } from "react";
import { fileSectionData } from "./files_data";
import CustomModal from "./modal";
import { staff } from "./staff_data";
export default function ViewFileModal({
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
      const file = fileSectionData.find((s) => s.file_id === file_id);
      if (!file) throw new Error("No case file found.");
      setCaseFileData(file);
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
            {/* const INITIAL_VISIBLE_COLUMNS = [ "file_id", "case_title", "status",
            "assigned_staff", "priority", "last_updated", "actions", ]; */}

            <table className="table-auto w-full border-collapse border border-gray-300">
              <tbody>
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Date Uploaded
                  </th>
                  <td className="border border-gray-300 px-4 py-2">
                    {caseFileData.date_uploaded}
                  </td>
                </tr>
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    File Name
                  </th>
                  <td className="border border-gray-300 px-4 py-2">
                    {caseFileData.file_name}
                  </td>
                </tr>
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Uploaded By
                  </th>
                  <td className="border border-gray-300 px-4 py-2">
                    {
                      staff.find(
                        (staffMember) =>
                          staffMember.staff_id === caseFileData.uploaded_by
                      )?.name
                    }
                  </td>
                </tr>
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left">
                    Associated Case
                  </th>
                  <td className="border border-gray-300 px-4 py-2">
                    {
                      // caseFiles.find(
                      //   (caseFile) => caseFile.case_id === caseFileData.case_id
                      // )?.title
                    }
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
