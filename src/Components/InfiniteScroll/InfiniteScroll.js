import {useEffect, useState} from "react"
import {ShowItems} from "./ShowItems"

const InfiniteScroll = () => {
	const [data, setData] = useState([])
	const [pageNo, setPageNo] = useState(1)

	useEffect(() => {
		fetch(`https://picsum.photos/v2/list?page=${pageNo}&limit=3`)
			.then((res) => res.json())
			.then((fetchedData) => {
				setData((prevData) => [...prevData, ...fetchedData])
			})
			.catch((error) => console.error("Error fetching data:", error))
	}, [pageNo])

	return <ShowItems data={data} setPageNo={setPageNo} />
}

export default InfiniteScroll
