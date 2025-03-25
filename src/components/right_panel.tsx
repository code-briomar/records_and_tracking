import { Accordion, AccordionItem, Avatar } from "@heroui/react";
const defaultContent =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

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
            startContent={
              <Avatar
                isBordered
                color="primary"
                radius="lg"
                src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
              />
            }
            subtitle="4 unread messages"
            title="Chung Miller"
          >
            {defaultContent}
          </AccordionItem>
          <AccordionItem
            key="2"
            aria-label="Janelle Lenard"
            startContent={
              <Avatar
                isBordered
                color="success"
                radius="lg"
                src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
              />
            }
            subtitle="3 incompleted steps"
            title="Janelle Lenard"
          >
            {defaultContent}
          </AccordionItem>
          <AccordionItem
            key="3"
            aria-label="Zoey Lang"
            startContent={
              <Avatar
                isBordered
                color="warning"
                radius="lg"
                src="https://i.pravatar.cc/150?u=a04258114e29026702d"
              />
            }
            subtitle={
              <p className="flex">
                2 issues to<span className="text-primary ml-1">fix now</span>
              </p>
            }
            title="Zoey Lang"
          >
            {defaultContent}
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
            startContent={
              <Avatar
                isBordered
                color="primary"
                radius="lg"
                src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
              />
            }
            subtitle="4 unread messages"
            title="Court Admin - Alex"
          >
            {defaultContent}
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default RightPanel;
