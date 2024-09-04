import {useEffect} from "react"

export const ShowItems = ({data, setPageNo}) => {
	useEffect(() => {
		const observer = new IntersectionObserver(
			(watchEle) => {
				if (watchEle[0].isIntersecting) {
					observer.unobserve(lastItem)
					setPageNo((prev) => prev + 1)
				}
			},
			{threshold: 0.5}
		)
		const lastItem = document.querySelector(".itemImage:last-child")
		if (!lastItem) {
			return
		}

		observer.observe(lastItem)
		return () => {
			if (lastItem) {
				observer.unobserve(lastItem)
			}
			observer.disconnect()
		}
	}, [data])

	return (
		<div style={{display: "flex", flexDirection: "column"}}>
			{data.map((item, index) => {
				return (
					<img
						style={{width: "200px", height: "200px", margin: "10px"}}
						src={item.download_url}
						key={index}
						className="itemImage"
					/>
				)
			})}
		</div>
	)
}
