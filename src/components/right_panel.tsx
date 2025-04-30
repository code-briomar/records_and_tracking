import { Accordion, AccordionItem, Card, CardBody } from "@heroui/react";
import { UserRound, X } from "lucide-react";
import { useState } from "react";
import { markNotificationAsRead } from "../services/notifications";
import { notifications as Notifications } from "./notifications_data";

const RightPanel = () => {
  const [notifications, setNotifications] = useState<any[]>(Notifications);
  const markNotification = async (notification_id: number) => {
    try {
      const response: any = await markNotificationAsRead(notification_id);
      if (response.error) {
        throw new Error(response.error);
      }

      // Optionally, you can remove the notification from the UI
      // or update its status to read.

      // Remove the notification from the list
      setNotifications((prevNotifications) =>
        prevNotifications.filter((n) => n.notification_id !== notification_id)
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };
  return (
    <div className="p-2 space-y-4">
      {/* Notifications */}
      <h1 className="m-2 text-gray-500">Notifications</h1>
      <div className="overflow-y-auto max-h-[calc(96vh-200px)]">
        {notifications.length == 0 && (
          <>
            <div className={"p-2"}>
              <p>No notifications right now</p>
            </div>
          </>
        )}

        {notifications
          .filter((n) => !n.read_status)
          .map((n) => (
            <Card
              key={n.notification_id}
              className="p-2 border dark:border-background/40 shadow-sm backdrop-blur-sm my-2"
            >
              <CardBody className="relative">
                <div
                  className={"flex justify-end absolute right-0 -top-0 z-99"}
                >
                  <button
                    onClick={() => markNotification(n.notification_id)}
                    className="w-6 right-0 p-1 rounded-full hover:bg-foreground/10 transition"
                    aria-label="Dismiss notification"
                  >
                    <X className="w-4 h-4 text-foreground/60 hover:text-foreground" />
                  </button>
                </div>
                <div>
                  <p className="text-sm font-medium">{n.message}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(n.date_created).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </p>
                </div>
              </CardBody>
            </Card>
          ))}
      </div>

      {/* Contacts (Example Placeholder) */}
      <div>
        <h1 className="m-2 text-gray-500">Contacts</h1>
        <Accordion selectionMode="multiple">
          <AccordionItem
            key="1"
            aria-label="Court Admin - Alex"
            startContent={<UserRound />}
            subtitle="4 unread messages"
            title="Court Admin - Alex"
          >
            <ul className="list-disc list-inside text-gray-700 text-sm">
              {notifications.map((n) => (
                <li key={n.notification_id}>{n.message}</li>
              ))}
            </ul>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default RightPanel;
