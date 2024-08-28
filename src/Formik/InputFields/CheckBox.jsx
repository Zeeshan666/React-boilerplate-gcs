import React from "react";
import { Field, ErrorMessage } from "formik";

export const CheckBox = (props) => {
	const { label, name, options, ...rest } = props;
	return (
		<div className="col-md-6">
			<div className="form-group-check pt-0">
				{label && <label className="form-label">{label} : </label>}
				<Field name={name}>
					{({ field }) => {
						return options.map((option) => (
							<div className="form-check form-check-inline" key={option.value}>
								<input
									className="form-check-input"
									type="checkbox"
									id={option.value}
									{...field}
									{...rest}
									value={option.value}
									checked={field.value.includes(option.value)}
								/>
								<label className="form-check-label" htmlFor={option.value}>
									{option.key}
								</label>
							</div>
						));
					}}
				</Field>
				<ErrorMessage component="span" name={name} className="text-danger" />
			</div>
		</div>
	);
};
