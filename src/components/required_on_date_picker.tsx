import { DatePicker } from "@heroui/react";
import {
  getLocalTimeZone,
  isWeekend,
  parseDate,
  today,
} from "@internationalized/date";
import { useLocale } from "@react-aria/i18n";
import { Field } from "formik";

const RequiredOnDatePicker = () => {
  const now = today(getLocalTimeZone());
  const { locale } = useLocale();

  // Define disabled date ranges
  const disabledRanges = [
    [now, now.add({ days: 5 })],
    [now.add({ days: 14 }), now.add({ days: 16 })],
    [now.add({ days: 23 }), now.add({ days: 24 })],
  ];

  const isDateUnavailable = (date: any) =>
    isWeekend(date, locale) ||
    disabledRanges.some(
      ([start, end]) => date.compare(start) >= 0 && date.compare(end) <= 0
    );

  return (
    <Field name="required_on">
      {({ field, form }: any) => (
        <DatePicker
          label="Required On"
          variant="bordered"
          value={field.value ? parseDate(field.value) : null}
          onChange={(date) => {
            if (date) {
              form.setFieldValue(field.name, date.toString()); // Store ISO 8601 string
            } else {
              form.setFieldValue(field.name, "");
            }
          }}
          isDateUnavailable={isDateUnavailable}
          minValue={today(getLocalTimeZone())}
        />
      )}
    </Field>
  );
};

export default RequiredOnDatePicker;
