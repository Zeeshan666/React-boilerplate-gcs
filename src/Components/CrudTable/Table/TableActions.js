import {
	editModalConfig,
	deleteModalConfig,
	addModalConfig,
} from "../Modal/ModalConfig"
import {v4 as uuidv4} from "uuid"

export const handleDelete = (showModal, deleteKey, setData) => {
	console.log("handleDelete")
	showModal(
		deleteModalConfig(() => {
			setData((prevData) => prevData.filter((item) => item.key !== deleteKey))
		})
	)
}
export const handleAdd = (showModal, setData, hideModal) => {
	console.log("handleAdd")
	showModal(
		addModalConfig((values) => {
			setData((prevData) => [...prevData, {key: uuidv4(), ...values}])
			hideModal()
		})
	)
}

export const handleEdit = (showModal, item, setData, hideModal) => {
	console.log("handleEdit")
	showModal(
		editModalConfig(item, (values) => {
			setData((prevData) =>
				prevData.map((i) => (i.key === item.key ? {...i, ...values} : i))
			)
			hideModal()
		})
	)
}
