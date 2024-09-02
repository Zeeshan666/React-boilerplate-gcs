export const columnStyles1 = {
	firstName: {
		headerStyle: {
			fontWeight: "bold",
			color: "blue",
		},
		render: (text) => {
			return <span style={{fontWeight: "bold", color: "blue"}}>{text}</span>
		},
	},
	age: {
		headerStyle: {
			color: "red",
		},
		render: (text) => {
			return <span style={{color: "red"}}>{text}</span>
		},
	},
	gender: {
		render: (text) => {
			let color
			if (text === "Female") {
				color = "pink"
			} else if (text === "Male") {
				color = "blue"
			} else {
				color = "black"
			}
			return <span style={{color}}>{text}</span>
		},
	},
	tags: {
		render: (tags) => {
			// Ensure tags is an array
			let tagArray = Array.isArray(tags)
				? tags
				: typeof tags === "string"
				? tags
						.replace(/[\[\]"']+/g, "") // Remove unwanted characters
						.split(",") // Split into an array by commas
						.map((tag) => tag.trim()) // Trim each tag
				: []

			return tagArray.map((tag, index) => (
				<span
					key={index}
					style={{
						backgroundColor: "black",
						color: "white",
						padding: "2px 6px",
						marginRight: "4px",
						borderRadius: "4px",
					}}
				>
					{tag}
				</span>
			))
		},
	},
}
