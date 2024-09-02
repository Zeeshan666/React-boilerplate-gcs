import React from "react"
import {optionalFeature, initialData} from "./InitialValues"
import {DynamicTable} from "./Table/DynamicTable"

function CrudTable() {
	return (
		<>
			{" "}
			<div style={{padding: "20px"}}>
				<h1>Dynamic Table Example</h1>
				<DynamicTable
					initialData={initialData}
					optionalFeature={optionalFeature}
				/>
			</div>
		</>
	)
}

export default CrudTable
