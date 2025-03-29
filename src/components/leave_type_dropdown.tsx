import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/react";
import { useField } from "formik";
import { ChevronDown } from "lucide-react";
import React from "react";

interface LeaveTypeDropdownProps {
  name: string;
}

export default function LeaveTypeDropdown({ name }: LeaveTypeDropdownProps) {
  const [field, , helpers] = useField(name); // Formik handles value & state updates

  const selectedKeys = new Set(
    field.value ? [field.value] : ["Type of Reason"]
  );

  const selectedValue = React.useMemo(
    () => Array.from(selectedKeys).join(", ").replace(/_/g, ""),
    [selectedKeys]
  );

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button className="capitalize" variant="bordered">
          {selectedValue}
          <ChevronDown />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        disallowEmptySelection
        aria-label="Leave Type Selection"
        selectedKeys={selectedKeys}
        selectionMode="single"
        variant="flat"
        onSelectionChange={(keys) => {
          const selected = Array.from(keys)[0] || "";
          helpers.setValue(selected); // Update Formik state
        }}
      >
        <DropdownItem key="sick">Sick</DropdownItem>
        <DropdownItem key="personal">Personal</DropdownItem>
        <DropdownItem key="emergency">Emergency</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
