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
  // const now = today(getLocalTimeZone());
  const { locale } = useLocale();

  const isDateUnavailable = (date: any) => isWeekend(date, locale);

  return (
    <Field name="required_on">
      {({ field, form }: any) => (
        <DatePicker
          label="Required On"
          variant="bordered"
          value={field.value ? parseDate(field.value.split("T")[0]) : null}
          onChange={(date) => {
            if (date) {
              form.setFieldValue(field.name, date.toString());
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
