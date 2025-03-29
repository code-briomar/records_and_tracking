import { useDisclosure } from "@heroui/react";

export function useModal() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return { isOpen, onOpen, onOpenChange };
}
