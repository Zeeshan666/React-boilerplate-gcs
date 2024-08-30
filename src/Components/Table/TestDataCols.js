import {v4 as uuidv4} from "uuid"

// Initial Data
export const initialData = [
	{
		key: uuidv4(),
		name: "Jim Green",
		age: 42,
		address: "London No. 1 Lake Park",
		gender: "male",
	},
	{
		key: uuidv4(),
		name: "Joe Black",
		age: 32,
		address: "Sydney No. 1 Lake Park",
		description: "111111111111111111111111111111111111111111111111111111",
	},
	{key: uuidv4(), name: "Joe Black", address: "Sydney No. 1 Lake Park"},
	{
		key: uuidv4(),
		name: "Joe Black",
		age: 32,
		address: "Sydney No. 2 Lake Park",
		club: "RM FC",
	},
	{
		key: uuidv4(),
		name: "Joe Black",
		age: 10,
		address: "Sydney No. 3 Lake Park",
	},
	{
		key: uuidv4(),
		name: "Joe Black",
		age: 10,
		address: "Sydney No. 4 Lake Park",
		club: "RM FC",
	},
]

// Get Column Definitions
export const getColumnDefinitions = (data) => {
	const allKeys = new Set()

	data.forEach((item) => {
		Object.keys(item).forEach((key) => {
			if (key !== "key") {
				allKeys.add(key)
			}
		})
	})

	return [...allKeys].map((key) => ({
		title: key.charAt(0).toUpperCase() + key.slice(1),
		dataIndex: key,
		key: key,
	}))
}
