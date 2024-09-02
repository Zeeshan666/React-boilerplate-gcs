import React from "react"
import {DatePicker as AntDatePicker} from "antd"
import {Field, ErrorMessage} from "formik"
import moment from "moment"
import dayjs from "dayjs"

const dateFormat = "DD/MM/YYYY" // Default date format

export const DatePicker = ({
	label,
	name,
	labelClass,
	fieldClass,
	errorClass,
	format = dateFormat, // Ensure the date format is "DD/MM/YYYY"
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
							format={format}
							// value={value ? moment(value, format, true) : null}
							// onChange={(date) =>
							// 	setFieldValue(name, date ? moment(date).format(format) : null)
							// }
							value={value ? dayjs(value, format, true) : null}
							onChange={(date) => {
								setFieldValue(name, date ? date.format(format) : null)
							}}
							{...rest}
						/>
					)
				}}
			</Field>
			<ErrorMessage
				component="span"
				name={name}
				className={errorClass}
				style={{color: "red"}}
			/>
		</>
	)
}
