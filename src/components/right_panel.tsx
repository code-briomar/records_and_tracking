import { Accordion, AccordionItem } from "@heroui/react";
import { UserRound } from "lucide-react";
import { notifications } from "./notifications_data";

const RightPanel = () => {
  return (
    <div className="p-2 space-y-4">
      {/* Notifications */}
      <div>
        <h1 className="m-2 text-gray-500">Notifications</h1>
        <Accordion selectionMode="multiple">
          {notifications
            .filter((n) => !n.read) // Only include unread notifications
            .map((n) => (
              <AccordionItem
                key={n.id}
                aria-label={n.message}
                startContent={<UserRound className="w-4 h-4" />}
                title={n.message}
              >
                <p className="text-gray-700 text-sm">{n.message}</p>
                <p className="text-xs text-gray-500">{n.date}</p>
              </AccordionItem>
            ))}
        </Accordion>
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
                <li key={n.id}>{n.message}</li>
              ))}
            </ul>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default RightPanel;
