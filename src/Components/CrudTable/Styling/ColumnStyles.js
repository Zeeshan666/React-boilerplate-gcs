export const columnStyles1 = {}

export const columnSimple = {
	name: {
		render: (text, record) => {
			const [firstName, lastName] = text.split(" ")
			return (
				<div>
					{firstName}
					<br />
					<span style={{display: "block", color: "blue"}}>{lastName}</span>
				</div>
			)
		},
	},
}
