import React from "react";
import { InputField } from "./InputFields/Input";
export const FormikControl = (props) => {
	const { control, ...rest } = props;

	switch (control) {
		case "input":
			return <InputField {...rest} />;
		// case "select":
		// 	return <Select {...rest} />;
		// case "textarea":
		// 	return <TextArea {...rest} />;
		// case "date":
		// 	return <DatePicker {...rest} />;
		// case "checkbox":
		// 	return <CheckBox {...rest} />;
		// case "radio":
		// 	return <Radio {...rest} />;
		default:
			return null;
	}
};
