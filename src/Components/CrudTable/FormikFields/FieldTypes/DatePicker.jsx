import React from "react"
import {DatePicker as AntDatePicker} from "antd"
import {Field, ErrorMessage} from "formik"
import moment from "moment"

const dateFormat = "DD/MM/YYYY"

export const DatePicker = ({
	label,
	name,
	labelClass,
	fieldClass,
	errorClass,
	format,
	...rest
}) => {
	return (
		<>
			<label htmlFor={name} className={labelClass}>
				{label}:
			</label>
			<Field name={name}>
				{({form, field}) => {
					const {setFieldValue} = form
					const {value} = field
					return (
						<AntDatePicker
							id={name}
							{...rest}
							format={format}
							value={value ? moment(value, format, true) : null}
							onChange={(date) =>
								setFieldValue(name, date ? date.format(format) : null)
							}
						/>
					)
				}}
			</Field>
			<ErrorMessage component="span" name={name} className={errorClass} />
		</>
	)
}
