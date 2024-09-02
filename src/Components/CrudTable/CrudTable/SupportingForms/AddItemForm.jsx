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
import {FormControls} from "../../../FormikFields/FormControls"

const fieldStyle = {marginBottom: 16}

const AddItemForm = ({initialValues, onAdd}) => (
	<Formik
		initialValues={initialValues}
		onSubmit={(values, {resetForm}) => {
			const formattedValues = {
				...values,
				joiningDate: values.joiningDate
					? moment(values.joiningDate).format(dateFormat) // Use the specified format
					: null,
			}
			onAdd(formattedValues)
			resetForm() // Reset form fields after submission
		}}
		validationSchema={validationSchema}
	>
		{({handleSubmit, setFieldValue, values}) => (
			<Form onSubmit={handleSubmit}>
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
					onChange={(date) => {
						setFieldValue("joiningDate", date ? date.format(dateFormat) : null)
					}}
					value={
						values.joiningDate ? moment(values.joiningDate, dateFormat) : null
					}
				/>
				<br />
				<Button type="primary" htmlType="submit">
					Add
				</Button>
			</Form>
		)}
	</Formik>
)

export default AddItemForm
