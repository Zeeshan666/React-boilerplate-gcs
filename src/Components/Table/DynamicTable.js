import React, {useState, useEffect} from "react"
import {Table, Divider, Tag} from "antd"
import {initialData, getColumnDefinitions} from "./TestDataCols"
import {TableHeader} from "./TableHeader"
import {
	validateAndReplaceData,
	getFilteredData,
	handleSearch,
	handleTableChange,
	handleColumnToggle,
	rowSelectionFunc,
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
	const [clickedLink, setClickedLink] = useState(null)

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
				bordered
				style={{backgroundColor: "#fafafa"}}
			>
				{columnDefinitions.map(
					(col) =>
						visibleColumns.includes(col.key) && (
							<Column
								title={
									<span style={{color: "#555", fontWeight: "bold"}}>
										{col.title}
									</span>
								}
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
								render={(text, record) => {
									let parsedText
									try {
										parsedText = JSON.parse(text)
									} catch (e) {
										parsedText = text
									}

									return (
										<>
											{(() => {
												switch (col.key) {
													case "firstName":
														return (
															<>
																<span
																	style={{
																		fontWeight: "bold",
																		color: "#1a73e8",
																		fontSize: "1.1em",
																	}}
																>
																	{parsedText}
																</span>
															</>
														)
													case "age":
														return (
															<>
																<span
																	style={{
																		color:
																			parsedText > 30 ? "#ff4d4f" : "#52c41a",
																		fontWeight: "500",
																	}}
																>
																	{parsedText}
																</span>
															</>
														)
													case "address":
														return (
															<>
																<span
																	style={{
																		color: "#666",
																		fontStyle: "italic",
																	}}
																>
																	{parsedText}
																</span>
															</>
														)
													case "tags":
														let tags = []
														try {
															tags = JSON.parse(record.tags)
														} catch (e) {
															console.error("Failed to parse tags:", e)
														}

														return (
															<>
																{tags.map((tag) => {
																	let color
																	if (tag.length > 7) {
																		color = "green"
																	} else if (tag.length === 5) {
																		color = "red"
																	} else {
																		color = "orange"
																	}
																	return (
																		<Tag
																			color={color}
																			key={tag}
																			style={{
																				fontSize: "0.9em",
																				padding: "0.2em 0.6em",
																			}}
																		>
																			{tag.toUpperCase()}
																		</Tag>
																	)
																})}
															</>
														)
													default:
														if (typeof parsedText === "string") {
															if (!parsedText.startsWith("http")) {
																return (
																	<>
																		<span style={{color: "#28a745"}}>
																			{parsedText}
																		</span>
																	</>
																)
															} else {
																return (
																	<>
																		<a
																			href={parsedText}
																			target="_blank"
																			rel="noopener noreferrer"
																			style={{
																				color:
																					clickedLink === parsedText
																						? "yellow"
																						: "#1a73e8",
																				textDecoration: "underline",
																				transition: "color 0.3s ease",
																			}}
																			onClick={(e) => {
																				setClickedLink(parsedText) // Set the clicked link
																				e.target.style.color = "purple"
																			}}
																			onMouseOver={(e) => {
																				e.target.style.color = "green"
																			}}
																			onMouseOut={(e) => {
																				e.target.style.color =
																					clickedLink === parsedText
																						? "purple"
																						: "#1a73e8"
																			}}
																		>
																			{parsedText}
																		</a>
																	</>
																)
															}
														}
														return (
															<>
																<span>{parsedText}</span>
															</>
														)
												}
											})()}
										</>
									)
								}}
							/>
						)
				)}
			</Table>

			<Divider />
		</>
	)
}
