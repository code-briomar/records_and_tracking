import { Card, Spinner } from "@heroui/react";
import { useEffect, useState } from "react";
import CustomModal from "./modal";
import { staff } from "./staff_data";
import {notifications} from "./notifications_data.tsx";

export default function ViewNotificationModal({
                                          notification_id,
                                          isOpen,
                                          onOpenChange,
                                      }: {
    notification_id: number;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [notificationData, setNotificationData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && notification_id) {
            fetchNotificationDetails();

            console.log("Staff ID: ", notification_id);
        }
    }, [isOpen, notification_id]);

    const fetchNotificationDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            const notification = notifications.find((s) => s.notification_id === notification_id);
            if (!notification) throw new Error("Notification Not found.");
            setNotificationData(notification);
        } catch (err: any) {
            console.error("Error fetching notification:", err);
            setError(err.message || "Failed to fetch notification details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <CustomModal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            title="Details"
        >
            {loading ? (
                <div className="flex justify-center items-center p-4">
                    <Spinner size="lg" />
                </div>
            ) : error ? (
                <p className="text-red-500 text-center">{error}</p>
            ) : (
                notificationData && (
                    <Card className="p-2 space-y-4 shadow-none">
                        {/* View Case File */}
                        {/* const INITIAL_VISIBLE_COLUMNS = [ "notification_id", "case_title", "status",
            "assigned_staff", "priority", "last_updated", "actions", ]; */}

                        <table className="table-auto w-full border-collapse border border-gray-300">
                            <tbody>
                            <tr>
                                <th className="border border-gray-300 px-4 py-2 text-left">
                                    Date
                                </th>
                                <td className="border border-gray-300 px-4 py-2">
                                    {notificationData.date_created}
                                </td>
                            </tr>
                            <tr>
                                <th className="border border-gray-300 px-4 py-2 text-left">
                                    Message
                                </th>
                                <td className="border border-gray-300 px-4 py-2">
                                    {notificationData.message}
                                </td>
                            </tr>
                            <tr>
                                <th className="border border-gray-300 px-4 py-2 text-left">
                                    Assigned To
                                </th>
                                <td className="border border-gray-300 px-4 py-2">
                                    {
                                        staff.find(
                                            (staffMember) =>
                                                staffMember.user_id === notificationData.user_id
                                        )?.name
                                    }
                                </td>
                            </tr>
                            <tr>
                                <th className="border border-gray-300 px-4 py-2 text-left">
                                    Status
                                </th>
                                <td className="border border-gray-300 px-4 py-2">
                                    {
                                        notificationData.read_status
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
