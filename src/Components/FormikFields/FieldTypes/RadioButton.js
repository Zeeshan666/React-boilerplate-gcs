import React from "react"
import {Field, ErrorMessage} from "formik"
import {Radio} from "antd"

const RadioGroup = Radio.Group

export const RadioButton = (props) => {
	const {label, name, options, labelClass, fieldClass, errorClass, ...rest} =
		props
	console.log(props?.options)
	return (
		<>
			<label className={labelClass}>{label} :</label>
			<Field name={name}>
				{({field, form}) => {
					const {setFieldValue} = form
					return (
						<RadioGroup
							{...rest}
							value={field.value}
							onChange={(e) => setFieldValue(name, e.target.value)}
						>
							{options &&
								options.map((option) => (
									<Radio key={option.value} value={option.value}>
										{option.label}
									</Radio>
								))}
						</RadioGroup>
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
