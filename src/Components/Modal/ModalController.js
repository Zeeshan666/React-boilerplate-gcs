import React, { useState } from "react";
import { Button } from "antd";
import { DynamicModal } from "./DynamicModal";

export const ModalController = ({ modalConfig }) => {
	const [isModalVisible, setIsModalVisible] = useState(false);

	const showModal = () => setIsModalVisible(true);
	const hideModal = () => setIsModalVisible(false);

	if (!modalConfig) {
		console.error("No modalConfig provided.");
		return null;
	}

	return (
		<>
			<Button
				type="primary"
				onClick={showModal}
			>
				{modalConfig.triggerText || "Open Modal"}
			</Button>
			<br />
			<br />

			<DynamicModal
				{...modalConfig}
				visible={isModalVisible}
				onCancel={hideModal}
			/>
		</>
	);
};
