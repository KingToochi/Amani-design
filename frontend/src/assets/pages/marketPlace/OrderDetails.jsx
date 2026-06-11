import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { BASE_URL } from "../../Url";
import CustomFetch from "../../hooks/UseFetch";
import ServerError from "../../components/ServerError";
import { Loader, ShoppingBag, AlertCircle } from "lucide-react"

const OrderDetails = () => {
    const [orderDetails, setOrderDetails] = useState();
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const {id} = useParams()
    const url = `${BASE_URL}/customerOrderDetails/${id}`

    const fetchOrderDetails = async() => {
        try {
            let response = await CustomFetch(url, {
                method: "GET"
            })

            if (response.ok){
                const details = await response.json()
                console.log(details)
                setOrderDetails(details.order)
                setError(null)
            }else {
                setError({message: "unable to fetch order details"})
            }
        }catch(error){
            setError(error)
        }finally {
            setLoading(false)
        }
    }

    useEffect(()=> {
        fetchOrderDetails()
    }, [])


    if (loading) {
        return(
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="h-12 w-12 animate-spin text-black mx-auto" />
                    <p className="mt-4 text-gray-600 font-light">Fetching your order details...</p>
                </div>
            </div>
        )
    }

    // if (error) {
    //     return(
    //         <div>
    //             <ServerError/>
    //         </div>
    //     )
    // }

    return(
        <div>
            <div>
                {orderDetails?.map(order => (
                    <div key={}>

                    </div>
                ))}
            </div>
        </div>
    )
}

export default OrderDetails;