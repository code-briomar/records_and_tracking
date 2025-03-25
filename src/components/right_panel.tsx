import { Accordion, AccordionItem } from "@heroui/react";
import { UserRound } from "lucide-react";
const defaultContent = [
  "New leave request submitted by Jane Doe.",
  "System maintenance scheduled for 10 PM tonight.",
  "Reminder: Staff meeting at 3 PM.",
  "Policy update: Work-from-home guidelines revised.",
  "You have 5 unread messages from HR.",
];

const RightPanel = () => {
  return (
    <div className="p-2 space-y-4">
      {/* Notifications */}
      <div>
        <h1 className="m-2 text-gray-500 ">Notifications</h1>
        <Accordion selectionMode="multiple">
          <AccordionItem
            key="1"
            aria-label="Chung Miller"
            startContent={<UserRound className="w-4 h-4" />}
            subtitle="4 unread messages"
            title="Chung Miller"
          >
            <ul className="list-disc list-inside text-gray-700 text-sm">
              {defaultContent.map((notification, index) => (
                <li key={index}>{notification}</li>
              ))}
            </ul>
          </AccordionItem>
          <AccordionItem
            key="2"
            aria-label="Janelle Lenard"
            startContent={<UserRound className="w-4 h-4" />}
            subtitle="3 incompleted steps"
            title="Janelle Lenard"
          >
            <ul className="list-disc list-inside text-gray-700 text-sm">
              {defaultContent.map((notification, index) => (
                <li key={index}>{notification}</li>
              ))}
            </ul>
          </AccordionItem>
          <AccordionItem
            key="3"
            aria-label="Zoey Lang"
            startContent={<UserRound className="w-4 h-4" />}
            subtitle={
              <p className="flex">
                2 issues to<span className="text-primary ml-1">fix now</span>
              </p>
            }
            title="Zoey Lang"
          >
            <ul className="list-disc list-inside text-gray-700 text-sm">
              {defaultContent.map((notification, index) => (
                <li key={index}>{notification}</li>
              ))}
            </ul>
          </AccordionItem>
        </Accordion>
      </div>
      {/* Contacts */}
      <div>
        <h1 className="m-2 text-gray-500 ">Contacts</h1>
        <Accordion selectionMode="multiple">
          <AccordionItem
            key="1"
            aria-label="Court Admin - Alex"
            startContent={<UserRound />}
            subtitle="4 unread messages"
            title="Court Admin - Alex"
          >
            <ul className="list-disc list-inside text-gray-700 text-sm">
              {defaultContent.map((notification, index) => (
                <li key={index}>{notification}</li>
              ))}
            </ul>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default RightPanel;
