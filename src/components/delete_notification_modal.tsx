import {
    addToast,
    Button,
    Card,
    CardBody,
    CardFooter,
    Spinner,
} from "@heroui/react";
import {LucideTrash2} from "lucide-react";
import { useEffect, useState } from "react";
import {deleteNotification} from "../services/notifications";
import CustomModal from "./modal";
import {fetchNotifications, notifications} from "./notifications_data.tsx";
export default function DeleteNotificationModal({
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

            console.log("Notification ID: ", notification_id);
        }
    }, [isOpen, notification_id]);

    const fetchNotificationDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            const notification = notifications.find((s) => s.notification_id === notification_id);

            if (!notification) throw new Error("Notification not found.");
            setNotificationData(notification);
        } catch (err: any) {
            console.error("Error fetching notification:", err);
            setError(err.message || "Failed to fetch notification details.");
        } finally {
            setLoading(false);
        }
    };

    const proceedWithDeletion = async () => {
        setLoading(true);
        setError(null);

        try {
            // ✅ Delete Notification
            console.log("Deleting notification ID:", notification_id);
            const response = await deleteNotification(notification_id);

            if (!response) {
                throw new Error(
                    "Failed to delete notification."
                );
            }

            console.log("Deleted Notification:", response);

            addToast({
                title: "Success",
                description: "Notification Deleted.",
                color: "success",
            });


            // ✅ Close Modal
            onOpenChange(false);
            // Refresh
            try {
                await fetchNotifications();
            } catch (error) {
                console.error("Error refreshing staff data:", error);
            }
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
            title="Are you sure you?"
        >
            {loading ? (
                <div className="flex justify-center items-center p-4">
                    <Spinner size="lg" />
                </div>
            ) : error ? (
                <p className="text-red-500 text-center">{error}</p>
            ) : (
                notificationData && (
                    <Card className="p-0 space-y-4 shadow-none">
                        <CardBody>
                            <p className="text-sm">
                                You're about to delete a notification.
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
