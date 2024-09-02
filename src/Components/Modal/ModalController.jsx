import React from "react"
import {DynamicModal} from "./DynamicModal"

export const ModalController = ({modalConfig, isModalVisible, hideModal}) => {
	if (!modalConfig) {
		console.error("No modalConfig provided.")
		return null
	}

	return (
		<DynamicModal
			{...modalConfig}
			visible={isModalVisible}
			onCancel={hideModal}
			onOk={hideModal}
		/>
	)
}
