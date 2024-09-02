import React from "react"
import {optionalFeature, initialData} from "./InitialValues"
import {DynamicTable} from "../../Table/DynamicTable"
import {ModalProvider} from "../ModalContext"

function CrudTable() {
	return (
		<>
			<ModalProvider>
				<div style={{padding: "20px"}}>
					<h1>Dynamic Table Example</h1>
					<DynamicTable
						initialData={initialData}
						optionalFeature={optionalFeature}
					/>
				</div>
			</ModalProvider>
		</>
	)
}

export default CrudTable
