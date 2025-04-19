import {
    addToast,
    Button,
    Card,
    CardBody,
    CardFooter,
    Spinner,
} from "@heroui/react";
import {Archive} from "lucide-react";
import { useEffect, useState } from "react";
import {markNotificationAsRead} from "../services/notifications";
import CustomModal from "./modal";
import {fetchNotifications, notifications} from "./notifications_data.tsx";
export default function ArchiveNotificationModal({
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

            console.log("Notification",notification)

            if (!notification) throw new Error("Notification not found.");
            setNotificationData(notification);
        } catch (err: any) {
            console.error("Error fetching notification:", err);
            setError(err.message || "Failed to fetch notification details.");
        } finally {
            setLoading(false);
        }
    };

    const archiveNotification = async () => {
        setLoading(true);
        setError(null);

        try {
            // ✅ Archive Notification
            console.log("Deleting notification ID:", notification_id);
            const response = await markNotificationAsRead(notification_id);

            if (!response) {
                throw new Error(
                    "Failed to archive notification."
                );
            }

            console.log("Archived Notification:", response);

            addToast({
                title: "Info",
                description: "Notification Archived.",
                color: "default",
            });


            // ✅ Close Modal
            onOpenChange(false);
            // Refresh
            await fetchNotifications();
            // This works but causes async issues
            window.location.reload();
        } catch (error: any) {
            console.error("Error during archiving:", error);

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
                notificationData && (
                    <Card className="p-0 space-y-4 shadow-none">
                        <CardBody>
                            <p className="text-sm">
                                You're about to archive a notification.
                            </p>
                        </CardBody>
                        <CardFooter className="flex justify-end">
                            <Button
                                variant="faded"
                                onPress={() => {
                                    archiveNotification();
                                }}
                            >
                                <Archive size={24} />
                            </Button>
                        </CardFooter>
                    </Card>
                )
            )}
        </CustomModal>
    );
}
