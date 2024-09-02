import React, {createContext, useContext, useState} from "react"

const ModalContext = createContext()

export const ModalProvider = ({children}) => {
	const [isModalVisible, setIsModalVisible] = useState(false)
	const [modalConfig, setModalConfig] = useState(null)

	const showModal = (config) => {
		setModalConfig(config)
		setIsModalVisible(true)
	}

	const hideModal = () => {
		setIsModalVisible(false)
		setModalConfig(null)
	}

	return (
		<ModalContext.Provider
			value={{isModalVisible, modalConfig, showModal, hideModal}}
		>
			{children}
		</ModalContext.Provider>
	)
}

export const useModal = () => useContext(ModalContext)
