import React from "react";
import { Modal, Button } from "antd";

export const DynamicModal = ({
	title,
	visible,
	onCancel,
	content,
	buttons = [],
	footer,
	...modalProps
}) => {
	return (
		<Modal
			title={title}
			visible={visible}
			onCancel={onCancel}
			maskClosable={false}
			footer={
				footer ||
				buttons.map((btn, index) => (
					<Button
						key={index}
						type={btn.type || "default"}
						onClick={() => {
							if (btn.onClick) btn.onClick();
							if (btn.closeOnClick !== false) {
								onCancel();
							}
						}}
						disabled={btn.disabled}
						style={btn.style}
						loading={btn.loading}
					>
						{btn.text}
					</Button>
				))
			}
			{...modalProps}
		>
			{content&&content()}
		</Modal>
	);
};
