import {tableStyles1} from "../CrudTable/Styling/TableStyles"
import {columnSimple} from "../CrudTable/Styling/ColumnStyles"

export const sampleData = [
	{
		name: "Alice Johnson",
		age: 29,
		email: "alice.johnson@example.com",
	},
	{
		name: "Bob Smith",
		age: 34,
		email: "bob.smith@example.com",
	},
	{
		name: "Charlie Brown",
		age: 22,
		email: "charlie.brown@example.com",
	},
	{
		name: "Diana Prince",
		age: 31,
		email: "diana.prince@example.com",
	},
	{
		name: "Edward Wilson",
		age: 27,
		email: "edward.wilson@example.com",
	},
]

export const optionalFeature = {
	searchFunctionality: true,
	toggleColumnVisibility: false,
	paginationValues: [1, 20, 30],
	enableEdit: false,
	enableDelete: false,
	enableAdd: false,
	styling: {
		table: tableStyles1,
		column: columnSimple,
	},
}
