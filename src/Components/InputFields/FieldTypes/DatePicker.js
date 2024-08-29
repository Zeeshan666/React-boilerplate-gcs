import React from "react";
import { DatePicker as AntDatePicker } from "antd";
import { Field, ErrorMessage } from "formik";

export const DatePicker = (props) => {
	const { label, name, labelClass, fieldClass, errorClass, ...rest } = props;
	return (
		<>
			<label htmlFor={name} className={labelClass}>
				{label}:
			</label>
			<Field name={name}>
				{({ form, field }) => {
					const { setFieldValue } = form;
					const { value } = field;
					return (
						<AntDatePicker
							id={name}
							{...field}
							{...rest}
							value={value}
							onChange={(date) => setFieldValue(name, date)}
						/>
					);
				}}
			</Field>
			<ErrorMessage component="span" name={name} className={errorClass} />
		</>
	);
};

/*
format="DD/MM/YY" // Display format
value={value ? moment(value, "DD/MM/YY") : null} // Format the value for display
onChange={(date, dateString) =>  setFieldValue(name, dateString) // Store in dd/mm/yy format


needs moment library
 */
