import {Formik, Field, Form, ErrorMessage} from "formik"
import {Input, Button, Checkbox, Radio, Select, DatePicker} from "antd"
import dayjs from "dayjs"
import {validationSchema} from "../InitialValues"

const tagOptions = [
	{label: "Admin", value: "Admin"},
	{label: "Manager", value: "Manager"},
	{label: "Developer", value: "Developer"},
	{label: "Staff", value: "Staff"},
	{label: "Intern", value: "Intern"},
]
const genderOptions = [
	{label: "Male", value: "Male"},
	{label: "Female", value: "Female"},
	{label: "Other", value: "Other"},
]
const jobTypeOptions = [
	{label: "Part-Time", value: "Part-Time"},
	{label: "Full-Time", value: "Full-Time"},
	{label: "Contract", value: "Contract"},
]
const dateFormat = "DD/MM/YYYY"
const {Option} = Select

export const deleteModalConfig = (onDelete) => ({
	title: "Delete Confirmation",
	content: () => <p>Are you sure you want to delete this item?</p>,
	buttons: [
		{
			text: "Cancel",
			type: "default",
			closeOnClick: true,
			onClick: () => console.log("Delete Cancelled"),
		},
		{
			text: "Delete",
			type: "primary",
			style: {backgroundColor: "red", borderColor: "red", color: "#fff"},
			closeOnClick: true,
			onClick: () => {
				onDelete()
				console.log("Item Deleted")
			},
		},
	],
	modalProps: {
		centered: true,
		width: 400,
	},
})

export const addModalConfig = (onAdd) => ({
	title: "AddItem",
	content: () => (
		<Formik
			initialValues={{
				firstName: "",
				lastName: "",
				age: "",
				city: "",
				gender: "",
				jobType: "Full-Time",
				joiningDate: "",
				tags: [],
				comments: "",
			}}
			onSubmit={(values, {resetForm}) => {
				// Convert date from moment object to formatted string

				onAdd(values)
				resetForm() // Reset form fields
			}}
			validationSchema={validationSchema}
		>
			{({handleSubmit, setFieldValue}) => (
				<Form onSubmit={handleSubmit}>
					<div style={{marginBottom: 16}}>
						<label>First Name</label>
						<Field name="firstName">{({field}) => <Input {...field} />}</Field>
						<ErrorMessage
							name="firstName"
							component="span"
							style={{color: "red"}}
						/>
					</div>
					<div style={{marginBottom: 16}}>
						<label>Age</label>
						<Field name="age">
							{({field}) => <Input type="number" {...field} />}
						</Field>
						<ErrorMessage name="age" component="span" style={{color: "red"}} />
					</div>
					<div style={{marginBottom: 16}}>
						<label>City</label>
						<Field name="city">{({field}) => <Input {...field} />}</Field>
						<ErrorMessage name="city" component="span" style={{color: "red"}} />
					</div>
					<div style={{marginBottom: 16}}>
						<label>Gender</label>
						<Field name="gender">
							{({field}) => (
								<Radio.Group
									options={genderOptions}
									value={field.value}
									onChange={(e) => setFieldValue(field.name, e.target.value)}
								/>
							)}
						</Field>
						<ErrorMessage
							name="gender"
							component="span"
							style={{color: "red"}}
						/>
					</div>
					<div style={{marginBottom: 16}}>
						<label>Tags</label>
						<Field name="tags">
							{({field}) => (
								<Checkbox.Group
									options={tagOptions}
									value={field.value}
									onChange={(values) => {
										const cleanedValues = values.map((tag) => tag.trim())
										setFieldValue(field.name, cleanedValues)
									}}
								/>
							)}
						</Field>
						<ErrorMessage name="tags" component="span" style={{color: "red"}} />
					</div>
					<div style={{marginBottom: 16}}>
						<label>Comments</label>
						<Field name="comments">
							{({field}) => (
								<Input.TextArea
									{...field}
									rows={4} // Set the number of rows for the textarea
									placeholder="Enter your comments here"
								/>
							)}
						</Field>
						<ErrorMessage
							name="comments"
							component="span"
							style={{color: "red"}}
						/>
					</div>
					<div style={{marginBottom: 16}}>
						<label>Job Type</label>
						<Field name="jobType">
							{({field}) => (
								<Select
									{...field}
									onChange={(value) => setFieldValue(field.name, value)}
								>
									{jobTypeOptions &&
										jobTypeOptions.map((option) => (
											<Option key={option.value} value={option.value}>
												{option.label}
											</Option>
										))}
								</Select>
							)}
						</Field>
						<ErrorMessage
							name="jobType"
							component="span"
							style={{color: "red"}}
						/>
					</div>
					<div style={{marginBottom: 16}}>
						<label>Joining Date</label>
						<Field name="joiningDate">
							{({field}) => (
								<DatePicker
									format={dateFormat}
									value={field.value ? dayjs(field.value, dateFormat) : null}
									onChange={(date) =>
										setFieldValue(
											field.name,
											date ? date.format(dateFormat) : null
										)
									}
								/>
							)}
						</Field>
						<ErrorMessage
							name="joiningDate"
							component="span"
							style={{color: "red"}}
						/>
					</div>
					<Button type="primary" htmlType="submit">
						Add
					</Button>
				</Form>
			)}
		</Formik>
	),
	buttons: [
		{
			text: "Cancel",
			type: "default",
			onClick: () => console.log("Add Cancelled"),
			closeOnClick: true,
		},
	],
	modalProps: {
		centered: true,
		width: 500,
	},
})

export const editModalConfig = (initialValues, onSave) => {
	const cleanTags = Array.isArray(initialValues.tags)
		? initialValues.tags.map((tag) => tag.trim())
		: typeof initialValues.tags === "string"
		? initialValues.tags
				.replace(/[\[\]"']+/g, "")
				.split(",") // Split by comma
				.map((tag) => tag.trim()) // Trim each tag
		: []

	// Format the initial joining date if present

	return {
		title: "Edit Item",
		content: () => (
			<Formik
				initialValues={{
					...initialValues,
					tags: cleanTags,
				}}
				onSubmit={(values, {resetForm}) => {
					const formattedValues = {
						...values,
						joiningDate: values.joiningDate
							? dayjs(values.joiningDate, dateFormat).format(dateFormat)
							: null,
					}
					onSave(formattedValues)
					resetForm() // Reset form fields
				}}
				validationSchema={validationSchema}
			>
				{({handleSubmit, setFieldValue}) => (
					<Form onSubmit={handleSubmit}>
						<div style={{marginBottom: 16}}>
							<label>First Name</label>
							<Field name="firstName">
								{({field}) => <Input {...field} />}
							</Field>
							<ErrorMessage
								name="firstName"
								component="span"
								style={{color: "red"}}
							/>
						</div>
						<div style={{marginBottom: 16}}>
							<label>Age</label>
							<Field name="age">
								{({field}) => <Input type="number" {...field} />}
							</Field>
							<ErrorMessage
								name="age"
								component="span"
								style={{color: "red"}}
							/>
						</div>
						<div style={{marginBottom: 16}}>
							<label>City</label>
							<Field name="city">{({field}) => <Input {...field} />}</Field>
							<ErrorMessage
								name="city"
								component="span"
								style={{color: "red"}}
							/>
						</div>
						<div style={{marginBottom: 16}}>
							<label>Gender</label>
							<Field name="gender">
								{({field}) => (
									<Radio.Group
										options={genderOptions}
										value={field.value}
										onChange={(e) => setFieldValue(field.name, e.target.value)}
									/>
								)}
							</Field>
							<ErrorMessage
								name="gender"
								component="span"
								style={{color: "red"}}
							/>
						</div>
						<div style={{marginBottom: 16}}>
							<label>Tags</label>
							<Field name="tags">
								{({field}) => (
									<Checkbox.Group
										options={tagOptions}
										value={field.value}
										onChange={(values) => {
											const cleanedValues = values.map((tag) => tag.trim())
											setFieldValue(field.name, cleanedValues)
										}}
									/>
								)}
							</Field>
							<ErrorMessage
								name="tags"
								component="span"
								style={{color: "red"}}
							/>
						</div>
						<div style={{marginBottom: 16}}>
							<label>Job Type</label>
							<Field name="jobType">
								{({field}) => (
									<Select
										{...field}
										onChange={(value) => setFieldValue(field.name, value)}
									>
										{jobTypeOptions &&
											jobTypeOptions.map((option) => (
												<Option key={option.value} value={option.value}>
													{option.label}
												</Option>
											))}
									</Select>
								)}
							</Field>
							<ErrorMessage
								name="jobType"
								component="span"
								style={{color: "red"}}
							/>
						</div>
						<div style={{marginBottom: 16}}>
							<label>Comments</label>
							<Field name="comments">
								{({field}) => (
									<Input.TextArea
										{...field}
										rows={4} // Set the number of rows for the textarea
										placeholder="Enter your comments here"
									/>
								)}
							</Field>
							<ErrorMessage
								name="comments"
								component="span"
								style={{color: "red"}}
							/>
						</div>
						<div style={{marginBottom: 16}}>
							<label>Joining Date</label>
							<Field name="joiningDate">
								{({field}) => (
									<DatePicker
										format={dateFormat}
										value={field.value ? dayjs(field.value, dateFormat) : null}
										onChange={(date) =>
											setFieldValue(
												field.name,
												date ? date.format(dateFormat) : null
											)
										}
									/>
								)}
							</Field>
							<ErrorMessage
								name="joiningDate"
								component="span"
								style={{color: "red"}}
							/>
						</div>
						<Button type="primary" htmlType="submit">
							Save Changes
						</Button>
					</Form>
				)}
			</Formik>
		),
		buttons: [
			{
				text: "Cancel",
				type: "default",
				onClick: () => console.log("Edit Cancelled"),
				closeOnClick: true,
			},
		],
		modalProps: {
			centered: true,
			width: 500,
		},
	}
}
