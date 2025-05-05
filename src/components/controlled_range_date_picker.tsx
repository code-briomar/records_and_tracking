import type { DateValue } from "@react-types/datepicker";
import type { RangeValue } from "@react-types/shared";

import { DateRangePicker } from "@heroui/react";
import React from "react";

export default function ControlledRangeDatePicker({
  setValue,
}: {
  value: RangeValue<DateValue> | null;
  setValue: (value: RangeValue<DateValue> | null) => void;
}) {
  //   const [value, setValue] = React.useState<RangeValue<DateValue> | null>({
  //     start: parseDate("2024-04-01"),
  //     end: parseDate("2024-04-08"),
  //   });

  //   let formatter = useDateFormatter({ dateStyle: "long" });

  const [rangePickerValue, setRangePickerValue] =
    React.useState<RangeValue<DateValue> | null>(null);

  return (
    <div className="flex flex-row gap-2">
      <div className="w-full flex flex-col gap-y-2">
        <DateRangePicker
          label="Search by date"
          value={rangePickerValue}
          onChange={(value) => {
            setValue(value);
            setRangePickerValue(value);
          }}
          aria-label="Date range"
        />
        {/* <p className="text-default-500 text-sm">
          Selected date:{" "}
          {value
            ? formatter.formatRange(
                value.start.toDate(getLocalTimeZone()),
                value.end.toDate(getLocalTimeZone())
              )
            : "--"}
        </p> */}
      </div>
    </div>
  );
}
