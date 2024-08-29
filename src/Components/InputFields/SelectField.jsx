import React from "react";
import { Field, ErrorMessage } from "formik";
import { Select } from "antd";

const { Option } = Select;

export const SelectField = (props) => {
	const {
		label,
		name,
		options,
		placeholder = "Select an option",
		mode = "multiple",
		labelClass,
		fieldClass,
		errorClass,
		...rest
	} = props;

	return (
		<>
			<label htmlFor={name} className={labelClass}>
				{label}
			</label>
			<Field name={name} className={fieldClass}>
				{({ field, form }) => {
					const { value } = field;
					const { setFieldValue, setFieldTouched } = form;

					return (
						<Select
							id={name}
							{...field}
							{...rest}
							mode={mode}
							value={value || []}
							onChange={(val) => setFieldValue(name, val)}
							onBlur={() => setFieldTouched(name, true)}
							placeholder={placeholder}
							style={{ width: "100%" }} // Ensure full width for the select
						>
							{options &&
								options.map((option) => (
									<Option key={option.value} value={option.value}>
										{option.key}
									</Option>
								))}
						</Select>
					);
				}}
			</Field>
			<ErrorMessage component="span" name={name} className={errorClass} />
		</>
	);
};
