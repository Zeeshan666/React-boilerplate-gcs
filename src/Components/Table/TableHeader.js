import React from "react"
import {Input, Button, Select, Space, Dropdown, Menu, Checkbox} from "antd"
import {SearchOutlined} from "@ant-design/icons"

const {Option} = Select

export const TableHeader = ({
	searchText,
	handleSearch,
	pagination,
	setPagination,
	columnDefinitions,
	visibleColumns,
	handleColumnToggle,
}) => {
	const columnMenu = (
		<Menu>
			{columnDefinitions &&
				columnDefinitions.map((col) => (
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

	return (
		<>
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
		</>
	)
}
