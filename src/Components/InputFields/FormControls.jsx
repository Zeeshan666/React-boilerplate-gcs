import React from "react";
import { InputField } from "./InputField";
import { CheckboxField, CheckBox } from "./CheckBox";
import { SelectField } from "./SelectField";
import { DatePicker } from "./DatePicker";
import { RadioButton } from "./RadioButton";
import { TextAreaField } from "./TextAreaField";
export const FormControls = (props) => {
	const { control, ...rest } = props;

	switch (control) {
		case "input":
			return <InputField {...rest} />;
		case "select":
			return <SelectField {...rest} />;
		case "textarea":
			return <TextAreaField {...rest} />;
		case "date":
			return <DatePicker {...rest} />;
		case "checkbox":
			return <CheckboxField {...rest} />;
		case "checkboxBool":
			return <CheckBox {...rest} />;
		case "radio":
			return <RadioButton {...rest} />;
		default:
			return null;
	}
};
