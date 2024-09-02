import {Formik, Form} from "formik"
import {Button} from "antd"
import moment from "moment"
import {validationSchema} from "../InitialValues"
import {
	tagOptions,
	genderOptions,
	jobTypeOptions,
	dateFormat,
} from "./supportingValues"
import {FormControls} from "Components/FormikFields/FormControls"
import dayjs from "dayjs"

const fieldStyle = {marginBottom: 16}

const ItemForm = ({initialValues, onSubmit, isEditMode}) => {
	// Clean the tags array or string
	const cleanTags = Array.isArray(initialValues.tags)
		? initialValues.tags.map((tag) => tag.trim())
		: typeof initialValues.tags === "string"
		? initialValues.tags
				.replace(/[\[\]"']+/g, "")
				.split(",") // Split by comma
				.map((tag) => tag.trim()) // Trim each tag
		: []

	// // Parse the joiningDate from string to moment object using "DD/MM/YYYY"
	// const initialDate = initialValues.joiningDate
	// 	? moment(initialValues.joiningDate, dateFormat, true) // `true` for strict parsing
	// 	: null

	const initialDate = initialValues.joiningDate
		? dayjs(initialValues.joiningDate, dateFormat, true) // `true` for strict parsing
		: null

	return (
		<Formik
			initialValues={{
				...initialValues,
				tags: cleanTags,
				joiningDate: initialDate,
			}}
			onSubmit={(values, {resetForm}) => {
				const formattedValues = {
					...values,
					// joiningDate: values.joiningDate
					// 	? moment(values.joiningDate).format(dateFormat) // Ensure "DD/MM/YYYY"
					// 	: null,
					// joiningDate: values.joiningDate
					// 	? dayjs(values.joiningDate).format(dateFormat) // Ensure "DD/MM/YYYY"
					// 	: null,
				}
				onSubmit(formattedValues)
				resetForm() // Reset form fields after submission
			}}
			validationSchema={validationSchema}
		>
			{({handleSubmit, setFieldValue, values}) => (
				<Form onSubmit={handleSubmit}>
					{/* Form fields */}
					<FormControls
						control="input"
						type="text"
						name="firstName"
						placeholder="Enter Your Name"
						tabIndex="1"
						label="First Name"
						style={fieldStyle}
					/>
					<FormControls
						control="input"
						type="number"
						name="age"
						placeholder="Enter Your Age"
						tabIndex="2"
						label="Age"
						style={fieldStyle}
					/>
					<FormControls
						control="input"
						type="text"
						name="city"
						placeholder="Enter Your City"
						tabIndex="3"
						label="City"
						style={fieldStyle}
					/>
					<FormControls
						control="radio"
						name="gender"
						label="Gender"
						tabIndex="4"
						options={genderOptions}
						style={fieldStyle}
					/>
					<br />
					<FormControls
						control="checkbox"
						name="tags"
						label="Skills"
						tabIndex="5"
						options={tagOptions}
						style={fieldStyle}
						onChange={(values) => {
							const cleanedValues = values.map((tag) => tag.trim())
							setFieldValue("tags", cleanedValues)
						}}
					/>
					<br />
					<FormControls
						control="select"
						name="jobType"
						label="Job Type"
						tabIndex="6"
						placeholder="Select Job Type"
						options={jobTypeOptions}
						style={fieldStyle}
					/>
					<br />
					<FormControls
						control="textarea"
						name="comments"
						label="Comments"
						placeholder="Enter Your Comments"
						tabIndex="7"
						rows={4}
						style={fieldStyle}
					/>
					<FormControls
						control="date"
						name="joiningDate"
						label="Joining Date"
						tabIndex="8"
						placeholder="Enter Joining Date"
						format={dateFormat} // Default format
						style={fieldStyle}
						// onChange={(date) => {
						// 	// Pass the date value formatted as per the dateFormat
						// 	setFieldValue(
						// 		"joiningDate",
						// 		date ? date.format(dateFormat) : null
						// 	)
						// }}
						// value={
						// 	values.joiningDate
						// 		? moment(values.joiningDate, dateFormat, true)
						// 		: null
						// }
						onChange={(date) => {
							setFieldValue(
								"joiningDate",
								date ? date.format(dateFormat) : null
							)
						}}
						value={
							values.joiningDate
								? dayjs(values.joiningDate, dateFormat, true)
								: null
						}
					/>
					<br />
					<Button type="primary" htmlType="submit">
						{isEditMode ? "Save Changes" : "Add"}
					</Button>
				</Form>
			)}
		</Formik>
	)
}

export default ItemForm
