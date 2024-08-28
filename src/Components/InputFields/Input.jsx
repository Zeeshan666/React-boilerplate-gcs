import React from "react";
import { Field, ErrorMessage } from "formik";

export const InputField = (props) => {
  const { label, name, imgsrc, ...rest } = props;
  return (
    <>
      <label htmlFor={name}>
        {label}
        <i className="float-end">
          <img src={imgsrc} />
        </i>
      </label>
      <Field id={name} name={name} className="form-control" {...rest} />
      <ErrorMessage component="span" name={name} className="text-danger" />
    </>
  );
};
