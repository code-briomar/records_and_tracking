import { invoke } from "@tauri-apps/api/core";

/**
 * Create a new notification.
 * @param message - The notification message.
 * @param type - The type of notification ('Info', 'Warning', 'Error', 'Success').
 * @param userId - The ID of the user the notification is for (optional).
 * @returns A promise resolving to a success message.
 */
export async function createNotification(
    message: string,
    type: "Info" | "Warning" | "Error" | "Success",
    userId?: number
): Promise<string> {
    try {
        const response: string = await invoke("create_notification", {
            message,
            type,
            user_id: userId,
        });
        console.log("Notification Created:", response);
        return response;
    } catch (error) {
        console.error("Error creating notification:", error);
        throw error;
    }
}

/**
 * Fetch all notifications or filter by user ID.
 * @param userId - Optional user ID to filter notifications.
 * @returns A promise resolving to an array of notifications.
 */
export async function getNotifications(userId?: number): Promise<any[]> {
    try {
        const response: any[] = await invoke("get_notifications", { user_id: userId });
        console.log("Fetched Notifications:", response);
        return response;
    } catch (error) {
        console.error("Error fetching notifications:", error);
        throw error;
    }
}

/**
 * Mark a notification as read.
 * @param notificationId - The ID of the notification to update.
 * @returns A promise resolving to a success message.
 */
export async function markNotificationAsRead(notificationId: number): Promise<string> {
    try {
        const response: string = await invoke("mark_notification_as_read", {
            notification_id: notificationId,
        });
        console.log("Notification Marked as Read:", response);
        return response;
    } catch (error) {
        console.error("Error marking notification as read:", error);
        throw error;
    }
}

/**
 * Delete a notification by its ID.
 * @param notificationId - The ID of the notification to delete.
 * @returns A promise resolving to a success message.
 */
export async function deleteNotification(notificationId: number): Promise<string> {
    try {
        const response: string = await invoke("delete_notification", { notification_id: notificationId });
        console.log("Notification Deleted:", response);
        return response;
    } catch (error) {
        console.error("Error deleting notification:", error);
        throw error;
    }
}
