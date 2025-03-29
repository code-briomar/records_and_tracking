import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/react";
// export const { isOpen, onOpen, onOpenChange } = useDisclosure();
export default function CustomModal({
  isOpen,
  onOpenChange,
  title,
  children, // ✅ Allows passing custom content (form, buttons, etc.)
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode; // ✅ Accepts form and buttons
}) {
  return (
    <Modal
      backdrop="opaque"
      classNames={{
        backdrop:
          "bg-gradient-to-t from-gray-200 to-gray-200/10 backdrop-opacity-40 dark:from-zinc-900 dark:to-zinc-900/10 dark:backdrop-opacity-20",
      }}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
        <ModalBody>{children}</ModalBody>{" "}
        {/* ✅ Form & buttons are passed here */}
      </ModalContent>
    </Modal>
  );
}
