import React from "react"
import {useModal} from "../../Context/ModalContext"
import {ModalController} from "../../Modal/ModalController"
import {Button} from "antd"
import {modalConfigOne} from "./SimpleModalConfig"

const SimpleModal = () => {
	const {isModalVisible, modalConfig, showModal, hideModal} = useModal()

	return (
		<>
			<Button onClick={() => showModal(modalConfigOne)}>Open Modal</Button>

			<ModalController
				modalConfig={modalConfig}
				isModalVisible={isModalVisible}
				hideModal={hideModal}
			/>
		</>
	)
}
export default SimpleModal
