import ItemForm from "./SupportingForms/ItemForm"

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
	title: "Add Item",
	content: () => (
		<ItemForm
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
			onSubmit={onAdd}
			isEditMode={false}
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

export const editModalConfig = (initialValues, onSave) => ({
	title: "Edit Item",
	content: () => (
		<ItemForm
			initialValues={initialValues}
			onSubmit={onSave}
			isEditMode={true}
		/>
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
})
