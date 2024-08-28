import React from "react";
import { Field, ErrorMessage } from "formik";

const CheckBox = (props) => {
	const { label, name, options, ...rest } = props;
	console.log(props);
	return (
		<div className="col-md-6">
			<div className="form-group-check pt-0">
				{label && <label className="form-label">{label}</label>}
				<Field name={name}>
					{({ field }) => (
						<>
							{options.map((option) => (
								<div
									className="form-check form-check-inline"
									key={option.value}
								>
									<input
										type="checkbox"
										id={option.value}
										className="form-check-input"
										{...field}
										{...rest}
										value={option.value}
										checked={field.value.includes(option.value)}
									/>
									<label
										className="form-check-label simple-label no-style"
										htmlFor={option.value}
									>
										{option.key}
									</label>
								</div>
							))}
						</>
					)}
				</Field>
				<ErrorMessage component="span" name={name} className="text-danger" />
			</div>
		</div>
	);
};

export default CheckBox;
