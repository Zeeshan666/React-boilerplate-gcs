import {tableStyles1} from "./Styling/TableStyles"
import {columnStyles1} from "./Styling/ColumnStyles"
import {v4 as uuidv4} from "uuid"
import * as Yup from "yup"
import {editModalConfig, addModalConfig, deleteModalConfig} from "./ModalConfig"
import {dateFormat} from "./SupportingForms/supportingValues"

export const initialData = [
	{
		key: uuidv4(),
		firstName: "John",
		age: 32,
		gender: "Male",
		city: "New York",
		tags: ["Developer", "Manager"],
		jobType: "Full-Time",
		comments: "lorem ipsum",
		joiningDate: "15/09/2024",
	},
	{
		key: uuidv4(),
		firstName: "Jane",
		age: 28,
		gender: "Female",
		city: "London",
		tags: ["Staff"],
		jobType: "Full-Time",
		comments: "lorem ipsum",
		joiningDate: "15/09/2024",
	},
	{
		key: uuidv4(),
		firstName: "Mike",
		age: 45,
		gender: "Male",
		city: "San Francisco",
		tags: ["Admin", "Manager"],
		jobType: "Full-Time",
		comments: "lorem ipsum",
		joiningDate: "15/09/2024",
	},
]

export const optionalFeature = {
	searchFunctionality: true,
	toggleColumnVisibility: true,
	paginationValues: [1, 20, 30],
	enableEdit: true,
	editModalConfig: editModalConfig,
	enableDelete: true,
	deleteModalConfig: deleteModalConfig,
	enableAdd: true,
	addModalConfig: addModalConfig,
	styling: {
		table: tableStyles1,
		column: columnStyles1,
	},
}

export const validationSchema = Yup.object().shape({
	firstName: Yup.string()
		.required("First name is required")
		.min(1, "First name must be at least 1 character")
		.max(100, "First name must be at most 100 characters"),
	age: Yup.number()
		.required("Age is required")
		.positive("Age must be a positive number")
		.integer("Age must be an integer")
		.min(0, "Age cannot be less than 0"),
	gender: Yup.string()
		.required("Gender is required")
		.oneOf(["Male", "Female", "Other"], "Invalid gender selection"),
	city: Yup.string().required("City is required"),
	tags: Yup.array()
		.of(Yup.string().required("Tag is required"))
		.min(1, "At least one tag is required"),
	jobType: Yup.string()
		.required("Job type is required")
		.oneOf(
			["Full-Time", "Part-Time", "Contract"],
			"Invalid job type selection"
		),
	comments: Yup.string()
		.required("Comments are required")
		.min(10, "Comments must be at least 10 characters")
		.max(250, "Comments must be at most 250 characters"),
	joiningDate: Yup.string()
		.required("Joining date is required")
		.matches(
			/^\d{2}\/\d{2}\/\d{4}$/,
			`Joining date must be in the format ${dateFormat}`
		)
		.test("valid-date", "Joining date must be a valid date", (value) => {
			const dateParts = value.split("/")
			const day = parseInt(dateParts[0], 10)
			const month = parseInt(dateParts[1], 10) - 1 // Months are 0-based in JS
			const year = parseInt(dateParts[2], 10)
			const date = new Date(year, month, day)
			return (
				date.getFullYear() === year &&
				date.getMonth() === month &&
				date.getDate() === day
			)
		}),
})
