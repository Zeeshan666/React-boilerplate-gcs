import AddItemForm from "./SupportingForms/AddItemForm"
import EditItemForm from "./SupportingForms/EditItemForm"

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
		<AddItemForm
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
			onAdd={onAdd}
		/>
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
	return {
		title: "Edit Item",
		content: () => (
			<EditItemForm initialValues={initialValues} onSave={onSave} />
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
