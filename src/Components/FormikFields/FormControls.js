import React from "react"
import * as InputOptions from "."

export const FormControls = (props) => {
	const {control, ...rest} = props

	const formControlOptions = {
		input: InputOptions.InputField,
		select: InputOptions.SelectField,
		textarea: InputOptions.TextAreaField,
		date: InputOptions.DatePicker,
		checkbox: InputOptions.CheckboxField,
		checkboxBool: InputOptions.CheckBox,
		radio: InputOptions.RadioButton,
	}

	const FormControl = formControlOptions[control]

	if (!FormControl) {
		return null
	}

	return <FormControl {...rest} />
}
