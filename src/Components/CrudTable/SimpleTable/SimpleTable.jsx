import React from "react"
import {optionalFeature, sampleData} from "./SimpleInitialValues"
import {DynamicTable} from "../Table/DynamicTable"

function SimpleTable() {
	return (
		<>
			{" "}
			<div style={{padding: "20px"}}>
				<h1>Simple Table Example</h1>
				<DynamicTable
					initialData={sampleData}
					optionalFeature={optionalFeature}
				/>
			</div>
		</>
	)
}

export default SimpleTable
