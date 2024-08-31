import {v4 as uuidv4} from "uuid"

// Initial Data
export const initialData = [
	{
		key: uuidv4(),
		firstName: "John",
		lastName: "Brown",
		age: 32,
		address: "New York No. 1 Lake Park",
		tags: ["nice", "developer"],
		website: "https://johndoe.com",
	},
	{
		key: uuidv4(),
		firstName: "Jim",
		lastName: "Green",
		age: 42,
		address: "London No. 1 Lake Park",
		tags: ["loser"],
		website: "https://jimgreen.com",
	},
	{
		key: uuidv4(),
		firstName: "Joe",
		lastName: "Black",
		age: 2,
		address: "Sydney No. 1 Lake Park",
		tags: ["cool", "teacher"],
		website: "http://joeblack.com",
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
