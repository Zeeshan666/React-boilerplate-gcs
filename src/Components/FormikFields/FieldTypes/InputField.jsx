import React from "react";
import { Field, ErrorMessage } from "formik";
import { Input } from "antd";

export const InputField = (props) => {
  const { label, name, imgsrc, labelClass, fieldClass, errorClass, ...rest } =
    props;

  return (
    <>
      <label htmlFor={name}>
        {label}
        {imgsrc && (
          <i className={labelClass}>
            <img src={imgsrc} alt="" />
          </i>
        )}
      </label>
      <Field name={name}>
        {({ field, form }) => (
          <Input
            id={name}
            {...field}
            {...rest}
            onChange={(e) => form.setFieldValue(name, e.target.value)}
            onBlur={() => form.setFieldTouched(name, true)}
          />
        )}
      </Field>
      <ErrorMessage component="span" name={name} className={errorClass} />
    </>
  );
};
