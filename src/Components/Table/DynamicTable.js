import React, {useState, useEffect} from "react"
import {Table, Input, Button, Select, Space, Divider, Checkbox, Menu, Dropdown} from "antd"
import {SearchOutlined} from "@ant-design/icons"
import {initialData, getColumnDefinitions} from "./TestDataCols"

const {Option} = Select
const {Column} = Table

const DynamicTable = () => {
	const [data, setData] = useState([])
	const [searchText, setSearchText] = useState("")
	const [pagination, setPagination] = useState({current: 1, pageSize: 10})
	const [sorter, setSorter] = useState({})
	const [visibleColumns, setVisibleColumns] = useState(["name", "age", "address"])
	const columnDefinitions = getColumnDefinitions(data)
	const columnKeys = columnDefinitions.map((col) => col.key)

	const validateAndReplaceData = (data, columnKeys) => {
		return data.map((item) => {
			const newItem = {...item}

			columnKeys.forEach((key) => {
				if (newItem[key] === undefined || newItem[key] === null) newItem[key] = "*"
				if (typeof newItem[key] === "number" && isNaN(newItem[key])) newItem[key] = "-"
				if (typeof newItem[key] === "string" && newItem[key].trim() === "") newItem[key] = "-"
				if (typeof newItem[key] === "object") newItem[key] = JSON.stringify(newItem[key])
				if (typeof newItem[key] === "boolean") newItem[key] = newItem[key] ? "true" : "false"
				if (typeof newItem[key] === "number") newItem[key] = newItem[key].toString()
			})

			return newItem
		})
	}

	useEffect(() => {
		const validatedData = validateAndReplaceData(initialData, columnKeys)
		setData(validatedData)
	}, [])

	const handleSearch = (value) => {
		setSearchText(value)
	}

	const handleTableChange = (pagination, filters, sorter) => {
		setPagination(pagination)
		setSorter(sorter)
	}

	const handleColumnToggle = (key) => {
		setVisibleColumns((prev) => (prev.includes(key) ? prev.filter((colKey) => colKey !== key) : [...prev, key]))
	}

	const columnMenu = (
		<Menu>
			{columnDefinitions.map((col) => (
				<Menu.Item key={col.key}>
					<Checkbox
						checked={visibleColumns.includes(col.key)}
						onChange={() => handleColumnToggle(col.key)}
					>
						{col.title}
					</Checkbox>
				</Menu.Item>
			))}
		</Menu>
	)

	const getFilteredData = () => {
		return data.filter((item) => {
			return columnKeys.some((key) => (item[key] || "").toString().toLowerCase().includes(searchText.toLowerCase()))
		})
	}

	const filteredData = getFilteredData()

	return (
		<div>
			<Space style={{marginBottom: 16}}>
				<Input
					placeholder="Search"
					value={searchText}
					onChange={(e) => handleSearch(e.target.value)}
					prefix={<SearchOutlined />}
					style={{width: 200}}
				/>
				<Select
					defaultValue={pagination.pageSize}
					onChange={(value) => setPagination({...pagination, pageSize: value})}
					style={{width: 120}}
				>
					<Option value={1}>1</Option>
					<Option value={2}>2</Option>
					<Option value={5}>5</Option>
					<Option value={10}>10</Option>
					<Option value={20}>20</Option>
				</Select>
				<Dropdown overlay={columnMenu}>
					<Button>Toggle Columns</Button>
				</Dropdown>
			</Space>

			<Table
				dataSource={filteredData}
				pagination={pagination}
				onChange={handleTableChange}
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
									if (typeof a[col.key] === "number" && typeof b[col.key] === "number") {
										return a[col.key] - b[col.key]
									}
									return (a[col.key] || "").toString().localeCompare((b[col.key] || "").toString())
								}}
								sortOrder={sorter.columnKey === col.key && sorter.order}
							/>
						)
				)}
			</Table>

			<Divider />
		</div>
	)
}

export default DynamicTable
