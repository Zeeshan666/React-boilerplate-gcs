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
	selectedColumnFilter,
	handleColumnFilters,
}) => {
	const {
		searchFunctionality = true,
		toggleColumnVisibility = true,
		paginationValues = [10],
		filterColumns = [],
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
	const filterMenu = (
		<Menu>
			{filterColumns.length > 0 &&
				filterColumns.map((filterCol) => (
					<Menu.Item key={filterCol.value}>
						<Checkbox
							checked={selectedColumnFilter.includes(filterCol.value)}
							onChange={() => handleColumnFilters(filterCol.value)}
						>
							{filterCol.label}
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
					<Dropdown overlay={columnMenu}>
						<Button>Toggle Columns</Button>
					</Dropdown>
				)}
				{filterColumns.length > 0 && (
					<Dropdown overlay={filterMenu}>
						<Button>Filter Columns</Button>
					</Dropdown>
				)}
			</Space>
		</>
	)
}
