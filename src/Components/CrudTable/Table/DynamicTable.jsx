import React, {useState, useEffect} from "react"
import {Table, Button, Space} from "antd"
import {EditFilled, DeleteFilled} from "@ant-design/icons"
import {TableHeader} from "./TableHeader"
import {
	getColumnDefiniton,
	validateAndReplaceData,
	getFilteredData,
	handleColumnToggle,
	handleSearch,
	handleTableChanges,
	sortData,
} from "./TableUtils"
import {handleEdit, handleDelete, handleAdd} from "./TableActions"
import {ModalController} from "../Modal/ModalController"

const {Column} = Table

export const DynamicTable = ({initialData, optionalFeature}) => {
	const [data, setData] = useState([])
	const [searchText, setSearchText] = useState("")
	const [paginationValue, setPaginationValue] = useState({
		current: 1,
		pageSize: 10,
	})
	const [sorter, setSorter] = useState({})
	const [visibleColumns, setVisibleColumns] = useState([])
	const [modalConfig, setModalConfig] = useState(null)
	const [isModalVisible, setIsModalVisible] = useState(false)

	const columnDefinitions = getColumnDefiniton(initialData)
	const columnKeys = columnDefinitions.map((col) => col.key)

	useEffect(() => {
		const validatedData = validateAndReplaceData(initialData, columnKeys)
		setData(validatedData)
		setVisibleColumns(columnKeys)
	}, [initialData])

	let filteredData = getFilteredData(data, columnKeys, searchText)

	useEffect(() => {
		filteredData = getFilteredData(data, columnKeys, searchText)
	}, [data])
	const {enableEdit, enableDelete, enableAdd, styling} = optionalFeature

	const showModal = (config) => {
		setModalConfig(config)
		setIsModalVisible(true)
	}

	const hideModal = () => {
		setIsModalVisible(false)
		setModalConfig(null)
	}

	return (
		<>
			<Space direction="vertical" style={{width: "100%"}}>
				<TableHeader
					searchText={searchText}
					handleSearch={(value) => handleSearch(value, setSearchText)}
					pagination={paginationValue}
					setPagination={setPaginationValue}
					columnDefinitions={columnDefinitions}
					visibleColumns={visibleColumns}
					handleColumnToggle={(key) =>
						handleColumnToggle(key, visibleColumns, setVisibleColumns)
					}
					optionalFeature={optionalFeature}
				/>
				<Table
					dataSource={filteredData}
					pagination={paginationValue}
					sortDirections={["ascend", "descend"]}
					loading={false}
					scroll={{x: "max-content"}}
					bordered
					style={styling?.table}
					onChange={(paginationValue, filter, sorter) => {
						handleTableChanges(
							paginationValue,
							setPaginationValue,
							sorter,
							setSorter
						)
					}}
				>
					{columnDefinitions &&
						columnDefinitions.map(
							(col) =>
								visibleColumns &&
								visibleColumns.includes(col.key) && (
									<Column
										title={
											<span style={styling?.column.header}>{col.title}</span>
										}
										dataIndex={col.dataIndex}
										key={col.key}
										sorter={(a, b) => sortData(a, b, col.key)}
										sortOrder={sorter.columnKey === col.key && sorter.order}
										render={(text) => {
											if (Array.isArray(text)) {
												return (
													<div>
														{text.map((item, index) => (
															<span key={index} style={styling?.column?.span}>
																{item}
															</span>
														))}
													</div>
												)
											}

											try {
												const parsed = JSON.parse(text)
												if (Array.isArray(parsed)) {
													return (
														<div>
															{parsed.map((item, index) => (
																<span key={index} style={styling?.column?.span}>
																	{item}
																</span>
															))}
														</div>
													)
												}
											} catch (e) {
												// Handle any JSON parsing errors
											}

											return <span style={styling?.column?.text}>{text}</span>
										}}
										style={styling?.column.cell} // Apply cell styles
									/>
								)
						)}

					{(enableEdit || enableDelete) && (
						<Column
							title="Actions"
							key="actions"
							render={(text, record) => (
								<Space size="middle">
									{enableEdit && (
										<Button
											type="primary"
											icon={<EditFilled />}
											style={{marginRight: 8}}
											onClick={() =>
												handleEdit(showModal, record, setData, hideModal)
											}
										>
											Edit
										</Button>
									)}
									{enableDelete && (
										<Button
											danger
											icon={<DeleteFilled />}
											type="primary"
											onClick={() =>
												handleDelete(showModal, record.key, setData)
											}
										>
											Delete
										</Button>
									)}
								</Space>
							)}
						/>
					)}
				</Table>
				{enableAdd && (
					<Button
						type="primary"
						style={{
							marginRight: 10,
							color: "black",
							backgroundColor: "#bae637",
						}}
						onClick={() => handleAdd(showModal, setData, hideModal)}
					>
						Add Record
					</Button>
				)}

				{modalConfig && (
					<ModalController
						modalConfig={modalConfig}
						isModalVisible={isModalVisible}
						hideModal={hideModal}
					/>
				)}
			</Space>
		</>
	)
}
