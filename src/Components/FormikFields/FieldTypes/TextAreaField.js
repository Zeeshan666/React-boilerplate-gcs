import React from "react";
import { Input } from "antd";
import { Field, ErrorMessage } from "formik";

const { TextArea } = Input;

export const TextAreaField = (props) => {
  const { label, name, labelClass, fieldClass, errorClass, ...rest } = props;

  return (
    <>
      <label className={labelClass}>{label}:</label>
      <Field name={name}>
        {({ field, form }) => {
          const { setFieldValue, setFieldTouched } = form;
          return (
            <TextArea
              {...field}
              {...rest}
              value={field.value || ""}
              onChange={(e) => setFieldValue(name, e.target.value)}
              onBlur={() => setFieldTouched(name, true)}
            />
          );
        }}
      </Field>
      <ErrorMessage component="span" name={name} className={errorClass} />
    </>
  );
};
