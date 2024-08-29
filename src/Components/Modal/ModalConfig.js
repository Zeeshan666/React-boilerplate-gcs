export const modalConfigOne = {
	title: "First Modal",
	content: <p>This is the content for the first modal.</p>,
	buttons: [
		{
			text: "Close",
			type: "default",
			onClick: () => console.log("First Modal Closed"),
			closeOnClick: true,
		},
		{
			text: "Confirm",
			type: "primary",
			onClick: () => console.log("First Modal Confirmed"),
			closeOnClick: true,
		},
		{
			text: "More",
			type: "link",
			onClick: () => console.log("First Modal More"),
			closeOnClick: false,
			style: { color: "red" },
		},
	],
	modalProps: {
		centered: true,
		width: 500,
	},
};

export const modalConfigTwo = {
	triggerText: "Open Second Modal",
	title: "Second Modal",
	content: <p>This is the content for the second modal.</p>,
	buttons: [
		{
			text: "Dismiss",
			type: "default",
			onClick: () => console.log("Second Modal Dismissed"),
			closeOnClick: true, // Close the modal when clicked
		},
		{
			text: "Agree",
			type: "primary",
			onClick: () => console.log("Second Modal Agreed"),
			closeOnClick: true, // Close the modal when clicked
		},
	],
	modalProps: {
		centered: true,
		width: 600,
	},
};

export const dirtyModalConfig = {
	triggerText: "Open Dirty Modal",
	title: "Dirty Modal",
	content: <p>This is the content for the dirty modal.</p>,
};
