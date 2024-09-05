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
	optionalFeature,
}) => {
	const {
		searchFunctionality = true,
		toggleColumnVisibility = true,
		paginationValues = [10],
	} = optionalFeature

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
				{searchFunctionality && (
					<Input
						placeholder="Search"
						value={searchText}
						onChange={(e) => handleSearch(e.target.value)}
						prefix={<SearchOutlined />}
						style={{width: 200}}
					/>
				)}
				<Select
					defaultValue={pagination.pageSize}
					onChange={(value) => setPagination({...pagination, pageSize: value})}
					style={{width: 120}}
				>
					{paginationValues.map((value) => (
						<Option key={value} value={value}>
							{value}
						</Option>
					))}
				</Select>
				{toggleColumnVisibility && (
					<Dropdown menu={columnMenu}>
						<Button>Toggle Columns</Button>
					</Dropdown>
				)}
			</Space>
		</>
	)
}
