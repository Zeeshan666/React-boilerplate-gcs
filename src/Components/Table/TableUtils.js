export const getColumnDefiniton = (data) => {
	if (!data || data.length === 0) {
		return []
	}

	return Object.keys(data[0])
		.filter((key) => key !== "key")
		.map((key) => ({
			title: key.charAt(0).toUpperCase() + key.slice(1),
			dataIndex: key,
			key,
		}))
}

export const validateAndReplaceData = (data, columnKeys) => {
	if (!Array.isArray(data) || data.length === 0) {
		return []
	}

	return data.map((item) => {
		const newItem = {...item}

		columnKeys.forEach((key) => {
			const value = newItem[key]

			if (value === undefined || value === null) {
				newItem[key] = ""
			} else if (typeof value === "number") {
				newItem[key] = isNaN(value) ? "" : value.toString()
			} else if (typeof value === "string") {
				newItem[key] = value.trim() === "" ? "" : value
			} else if (typeof value === "object") {
				newItem[key] = Array.isArray(value)
					? JSON.stringify(value)
					: JSON.stringify(value)
			} else if (typeof value === "boolean") {
				newItem[key] = value ? "true" : "false"
			}
		})

		return newItem
	})
}

export const getFilteredData = (data, columnKeys, searchText) => {
	return data.filter((rowData) => {
		return columnKeys.some((column) =>
			(rowData[column] || "")
				.toString()
				.toLowerCase()
				.includes(searchText.toLowerCase())
		)
	})
}

export const handleSearch = (searchTerm, setSearchText) => {
	setSearchText(searchTerm)
}

export const handleTableChanges = (
	paginationValue,
	setPaginationValue,
	sorter,
	setSorter
) => {
	setPaginationValue(paginationValue)
	setSorter(sorter)
}

export const handleColumnToggle = (key, visibleColumns, setVisibleColumns) => {
	setVisibleColumns((prev) =>
		prev.includes(key)
			? prev.filter((colKey) => colKey !== key)
			: [...prev, key]
	)
}

export const sortData = (a, b, key) => {
	if (typeof a[key] === "number" && typeof b[key] === "number") {
		return a[key] - b[key]
	}
	return (a[key] || "").toString().localeCompare((b[key] || "").toString())
}

export const handleSelectedRows = (
	selectedRowKeys,
	setSelectedRowKeys,
	selectedRows
) => {
	setSelectedRowKeys(selectedRowKeys)
	console.log("Selected Row Keys: ", selectedRowKeys)
	console.log("Selected Rows: ", selectedRows)
}
