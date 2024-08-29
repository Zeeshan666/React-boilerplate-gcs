import React from "react";
import { Field, ErrorMessage } from "formik";
import { Checkbox } from "antd";

export const CheckBox = (props) => {
	const {
		label,
		name,
		options,
		labelClass,
		keyClass,
		fieldClass,
		errorClass,
		...rest
	} = props;
	console.log(props);
	return (
		<>
			<Field name={name}>
				{({ field }) => (
					<>
						{options &&
							options.map((option) => (
								<div className={keyClass} key={option.value}>
									<input
										type="checkbox"
										id={option.value}
										className={fieldClass}
										{...field}
										{...rest}
										value={option.value}
										// checked={field.value.includes(option.value)}
									/>
									<label className={labelClass} htmlFor={option.value}>
										{option.key}
									</label>
								</div>
							))}
					</>
				)}
			</Field>
			<ErrorMessage component="span" name={name} className={errorClass} />
		</>
	);
};

const CheckboxGroup = Checkbox.Group;

export const CheckboxField = (props) => {
	const {
		label,
		name,
		options,
		labelClass,
		keyClass,
		fieldClass,
		errorClass,
		...rest
	} = props;

	return (
		<>
			<label className={labelClass}>{label}:</label>
			<Field name={name}>
				{({ field, form }) => {
					const { setFieldValue, setFieldTouched } = form;
					return (
						<CheckboxGroup
							{...rest}
							value={field.value || []}
							onChange={(checkedValues) => setFieldValue(name, checkedValues)}
							onBlur={() => setFieldTouched(name, true)}
						>
							{options &&
								options.map((option) => (
									<div className={keyClass} key={option.value}>
										<Checkbox value={option.value}>{option.key}</Checkbox>
									</div>
								))}
						</CheckboxGroup>
					);
				}}
			</Field>
			<ErrorMessage component="span" name={name} className={errorClass} />
		</>
	);
};
