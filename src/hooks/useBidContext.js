import { BidContext } from "../Context/bidContext"
import { useContext } from "react"

export const useBidContext = () => {
    const context = useContext(BidContext)

    if (!context) {
        throw Error('useBidContext must be used inside an BidContextProvider')
    }

    return context
}