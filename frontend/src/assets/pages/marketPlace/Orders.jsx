import { BASE_URL } from "../../Url";
import CustomFetch from "../../hooks/UseFetch";
import { useState, useEffect } from "react";
import ServerError from "../../components/ServerError";
import { useNavigate } from "react-router-dom";
import { Loader, ShoppingBag, AlertCircle } from "lucide-react";

const CustomerOrder = () => {
    const [ordersData, setOrdersData] = useState([])
    const [orders, setOrders] = useState([])
    const url = `${BASE_URL}/customerOrders`
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [orderStatus, setOrderStatus] = useState([])
    const navigate = useNavigate()

    const fetchOrders = async() => {
        try{
            let response = await CustomFetch(url, {
                method: "GET"
            })
            let data = await response.json();
            if (response.ok) {
                setOrdersData(data.orders)
                setOrders(data.orders)
                setOrderStatus([
                    "all orders",
                    ...new Set(data.orders.map(order => order.orderStatus))
                ])
                
            }
        }catch(error){
            setError(error.message)
            
        }finally {
            setLoading(false)
        }
    }

    const handleOrderStatus = (status) => {
        if (status === "all orders"){
            setOrders(ordersData)
        }else{
            setOrders(
                ordersData.filter(
                    order => order.orderStatus === status
                )
            )
        }
    }

    const handleViewOrder = (id) => {
        navigate(`/orderDetails/${id}`)
    }

    useEffect(() => {
        fetchOrders();
    }, [])

    if (loading) {
        return(
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="h-12 w-12 animate-spin text-black mx-auto" />
                    <p className="mt-4 text-gray-600 font-light">Fetching your orders...</p>
                </div>
            </div>
        )
    }
    if (error) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                    <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
                        <div className="text-center">
                            <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
                            <h2 className="text-xl font-semibold mb-2">Orders Unavailable</h2>
                            <p className="text-gray-600 mb-6">{error}</p>
                            <button 
                                onClick={() => navigate('/login')}
                                className="w-full bg-black text-white py-3 rounded-full hover:bg-gray-800 transition font-medium"
                            >
                                Sign In to Continue
                            </button>
                        </div>
                    </div>
                </div>
            );
    }

    if (orders.length === 0 ) {
        return(
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
                    <ShoppingBag size={48} className="mx-auto mb-4 text-gray-400" />
                    <h2 className="text-xl font-semibold mb-2">No order made yet</h2>
                    <p className="text-gray-600 mb-6">Add some items to your cart make your order.</p>
                    <button 
                        onClick={() => window.location.href = '/products'}
                        className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition font-medium"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        )
    }

    

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div>
                {orderStatus.map((status, index) => {
                    return (<button
                    key={index}
                    onClick={()=>handleOrderStatus(status)}
                    className="px-4 py-2 mr-2 mb-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    {status}
                </button>
                    )
                })}
            </div>
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col gap-4 mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900">Status</h2>
                </div>

                <div className="overflow-x-auto bg-white shadow rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200 table-auto">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Number</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Currency</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Items</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50 transition-colors duration-150">
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order?.orderNumber}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{order?.paymentStatus}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{order?.currency}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{order?.amount}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order?.items?.reduce((totalCount,item)=> {
                                        return totalCount + item.quantity
                                    },0)}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{order.deliveryDate
                                    ? new Date(order.deliveryDate).toLocaleDateString()
                                    : "_"}</td>
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{order?.orderStatus}</td>
                                    {/* <td className="px-4 py-4 whitespace-nowrap text-sm">
                                        <button onClick={()=>handleViewOrder(order._id)} className="text-green-700 hover:text-green-900 cursor-pointer">View Order Details</button>
                                    </td> */}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default CustomerOrder;