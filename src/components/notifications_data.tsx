import { getNotifications } from "../services/notifications";
export interface Notification {
  notification_id: number;
  user_id: number;
  message: string;
  notification_type: "Info" | "Warning" | "Success" | "Error";
  date_created: string;
  read_status: boolean;
}

export let notifications: Notification[] = [];
export const fetchNotifications = async () => {
  try {
    notifications = await getNotifications();
    notifications = notifications.filter((each) => !each.read_status);
  } catch (error) {
    console.error("Error fetching notifications:", error);
  } finally {
    console.log("Fetched Notifications:", notifications);
  }
};

(async () => {
  try {
    await fetchNotifications();
  } catch (error) {
    console.error("Error refreshing staff data:", error);
  }
})();

// export const notifications: Notification[] = [
//   {
//     id: "1",
//     message: "New case file added.",
//     type: "Info",
//     date: "2025-03-24",
//     read: false,
//   },
//   {
//     id: "2",
//     message: "System update scheduled.",
//     type: "Warning",
//     date: "2025-03-22",
//     read: true,
//   },
//   {
//     id: "3",
//     message: "Case resolved successfully.",
//     type: "Success",
//     date: "2025-03-20",
//     read: false,
//   },
//   {
//     id: "4",
//     message: "Unauthorized auth detected!",
//     type: "Error",
//     date: "2025-03-18",
//     read: false,
//   },
// ];
