import { useState, useEffect } from "react"
import {BASE_URL} from "../../Url"
import CustomFetch from "../../hooks/UseFetch"

const Orders = () => {
    const[pendingOrder, setPendingOrder] = useState(null)
    const[totalOrder, settotalOrder] = useState(null)
    const[DeliveredOrder, setDeliveredOrder] = useState(null)
    const url  = `${BASE_URL}/orders`
    const fetchOrder = async() => {
        try{
            let response = await CustomFetch(url, {
                "method" : "GET",
            })


        }catch(error) {
            console.log(error)
        }
    }
    
}