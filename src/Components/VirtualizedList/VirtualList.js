import React, {useState} from "react"

/* 
    Below is for fixed item height
    {items, itemHeight, containerHeight} can also be used for this
*/
function VirtualizedList() {
	const containerHeight = 500
	const itemHeight = 50

	const items = Array.from({length: 100000}, (_, index) => index)

	const [visibleItems, setVisibleItems] = useState([
		0,
		Math.floor(containerHeight / itemHeight),
	])

	const handleScroll = (e) => {
		const scrollTop = e.target.scrollTop
		const newStart = Math.floor(scrollTop / itemHeight)
		const newEnd = Math.min(
			items.length - 1,
			Math.floor(containerHeight / itemHeight) + newStart
		)
		setVisibleItems([newStart, newEnd])
	}

	return (
		<>
			<h1>Virtualized List</h1>
			<div
				className="container"
				onScroll={handleScroll}
				style={{
					height: containerHeight,
					width: 200,
					overflowY: "auto",
					background: "grey",
				}}
			>
				<div
					style={{
						height: items.length * itemHeight,
						position: "relative",
					}}
				>
					{items.slice(visibleItems[0], visibleItems[1] + 1).map((item) => (
						<div
							className="item"
							style={{
								height: itemHeight,
								background: "red",
								borderTop: "5px solid black",
								position: "absolute",
								top: item * itemHeight,
								left: 0,
								right: 0,
							}}
							key={item}
						>
							{item}
						</div>
					))}
				</div>
			</div>
		</>
	)
}

export default VirtualizedList
