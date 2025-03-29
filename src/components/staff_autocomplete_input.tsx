import { Autocomplete, AutocompleteItem, Avatar } from "@heroui/react";
import { useField } from "formik";
import { staff } from "./staff_data";

interface StaffAutoCompleteInputProps {
  name: string;
}

export default function StaffAutoCompleteInput({
  name,
}: StaffAutoCompleteInputProps) {
  const [field, , helpers] = useField(name);

  return (
    <Autocomplete
      className="max-w-xs"
      defaultItems={staff}
      label="Select staff member"
      labelPlacement="inside"
      placeholder="Search..."
      variant="bordered"
      selectedKey={field.value} // Bind value to Formik state
      onSelectionChange={(selected) => helpers.setValue(selected)} // Update Formik state
      onBlur={field.onBlur} // Trigger Formik's onBlur
    >
      {(user) => (
        <AutocompleteItem key={user.staff_id} textValue={user.name}>
          <div className="flex gap-2 items-center">
            <Avatar
              alt={user.name}
              className="flex-shrink-0"
              size="sm"
              src={user.avatar}
            />
            <div className="flex flex-col">
              <span className="text-small">{user.name}</span>
              <span className="text-tiny text-default-400">{user.email}</span>
            </div>
          </div>
        </AutocompleteItem>
      )}
    </Autocomplete>
  );
}
