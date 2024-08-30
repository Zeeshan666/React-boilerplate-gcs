import React, {useState, useEffect} from "react"
import {Table, Divider} from "antd"
import {initialData, getColumnDefinitions} from "./TestDataCols"
import {TableHeader} from "./TableHeader"
import {
	validateAndReplaceData,
	getFilteredData,
	handleSearch,
	handleTableChange,
	handleColumnToggle,
} from "./TableUtils"

const {Column} = Table

export const DynamicTable = () => {
	const [data, setData] = useState([])
	const columnDefinitions = getColumnDefinitions(initialData)
	const columnKeys = columnDefinitions.map((col) => col.key)
	const [searchText, setSearchText] = useState("")
	const [pagination, setPagination] = useState({current: 1, pageSize: 10})
	const [sorter, setSorter] = useState({})
	const [visibleColumns, setVisibleColumns] = useState([])

	useEffect(() => {
		const validatedData = validateAndReplaceData(initialData, columnKeys)

		setData(validatedData)
		setVisibleColumns(columnKeys)
	}, [])

	const filteredData = getFilteredData(data, columnKeys, searchText)

	return (
		<>
			<TableHeader
				searchText={searchText}
				handleSearch={(value) => handleSearch(value, setSearchText)}
				pagination={pagination}
				setPagination={setPagination}
				columnDefinitions={columnDefinitions}
				visibleColumns={visibleColumns}
				handleColumnToggle={(key) =>
					handleColumnToggle(key, visibleColumns, setVisibleColumns)
				}
			/>

			<Table
				dataSource={filteredData}
				pagination={pagination}
				onChange={(pagination, filters, sorter) =>
					handleTableChange(pagination, setPagination, sorter, setSorter)
				}
				rowKey="key"
				sortDirections={["ascend", "descend"]}
				loading={false}
				scroll={{x: "max-content"}}
			>
				{columnDefinitions.map(
					(col) =>
						visibleColumns.includes(col.key) && (
							<Column
								title={col.title}
								dataIndex={col.dataIndex}
								key={col.key}
								sorter={(a, b) => {
									if (
										typeof a[col.key] === "number" &&
										typeof b[col.key] === "number"
									) {
										return a[col.key] - b[col.key]
									}
									return (a[col.key] || "")
										.toString()
										.localeCompare((b[col.key] || "").toString())
								}}
								sortOrder={sorter.columnKey === col.key && sorter.order}
							/>
						)
				)}
			</Table>

			<Divider />
		</>
	)
}
