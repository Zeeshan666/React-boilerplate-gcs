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
import {useModal} from "../../Context/ModalContext"
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
	const [selectedRowKeys, setSelectedRowKeys] = useState([])

	const {isModalVisible, modalConfig, showModal, hideModal} = useModal()

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

	const rowSelection = {
		selectedRowKeys,
		onChange: (selectedRowKeys, selectedRows) => {
			setSelectedRowKeys(selectedRowKeys)
			console.log("Selected Row Keys: ", selectedRowKeys)
			console.log("Selected Rows: ", selectedRows) // Logs the entire selected row objects
		},
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
					setData={setData}
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
					rowSelection={rowSelection}
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
											<span style={styling?.column[col.key]?.headerStyle || {}}>
												{col.title}
											</span>
										}
										dataIndex={col.dataIndex}
										key={col.key}
										sorter={(a, b) => sortData(a, b, col.key)}
										sortOrder={sorter.columnKey === col.key && sorter.order}
										render={(text, record) =>
											styling?.column[col.key]?.render(text, record) || (
												<span>{text}</span>
											)
										}
										style={styling?.column[col.key]?.cellStyle || {}} // Apply cell styles
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
												handleEdit(
													showModal,
													record,
													setData,
													hideModal,
													optionalFeature.editModalConfig
												)
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
												handleDelete(
													showModal,
													record.key,
													setData,
													optionalFeature.deleteModalConfig
												)
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
						onClick={() =>
							handleAdd(
								showModal,
								setData,
								hideModal,
								optionalFeature.addModalConfig
							)
						}
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
