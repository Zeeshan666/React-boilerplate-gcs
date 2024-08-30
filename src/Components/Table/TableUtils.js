export const validateAndReplaceData = (data, columnKeys) => {
	return data.map((item) => {
		const newItem = {...item}

		columnKeys.forEach((key) => {
			if (newItem[key] === undefined || newItem[key] === null) newItem[key] = ""
			if (typeof newItem[key] === "number" && isNaN(newItem[key]))
				newItem[key] = ""
			if (typeof newItem[key] === "string" && newItem[key].trim() === "")
				newItem[key] = ""
			if (typeof newItem[key] === "object")
				newItem[key] = JSON.stringify(newItem[key])
			if (typeof newItem[key] === "boolean")
				newItem[key] = newItem[key] ? "true" : "false"
			if (typeof newItem[key] === "number")
				newItem[key] = newItem[key].toString()
		})

		return newItem
	})
}

export const getFilteredData = (data, columnKeys, searchText) => {
	return data.filter((item) => {
		return columnKeys.some((key) =>
			(item[key] || "")
				.toString()
				.toLowerCase()
				.includes(searchText.toLowerCase())
		)
	})
}

export const handleSearch = (value, setSearchText) => {
	setSearchText(value)
}

export const handleTableChange = (
	pagination,
	setPagination,
	sorter,
	setSorter
) => {
	setPagination(pagination)
	setSorter(sorter)
}

export const handleColumnToggle = (key, visibleColumns, setVisibleColumns) => {
	setVisibleColumns((prev) =>
		prev.includes(key)
			? prev.filter((colKey) => colKey !== key)
			: [...prev, key]
	)
}
