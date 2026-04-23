import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../marketPlace/hooks/AuthProvider";  
import {BASE_URL} from "../../Url";
import ServerError from "../../components/ServerError";

const Dashboard = () => {
    const url = BASE_URL;
    const { auth } = useContext(AuthContext);
    const token = localStorage.getItem("token");
    const [sales, setSales] = useState({});
    const [orders, setOrders] = useState({});
    const [comments, setComments] = useState({});
    const [ratings, setRatings] = useState({});
    const [loading, setLoading] = useState(true);
    const [serverError, setServerError] = useState({});
    const fetchData = async () => {
        try {
            if (!token) return;
        if(auth?.role !== "vendor" && auth?.role !== "designer") return;

        const productAnalytics = await fetch(`${url}/designer/productAnalytics`, {
            method: "GET",
            headers: {
                authorization : `Bearer ${token}`
            }
        })
        let data = await productAnalytics.json();
        if (data.success) {
            setSales(data.sales);
            setOrders(data.orders);
            setComments(data.comments);
            setRatings(data.ratings);
            setLoading(false);
            console.log(data)
        }else {
            setServerError({message: data.message});
            setTimeout(() => {
                setServerError(null);
            },5000)
        }
        console.log(data);
        console.log(data.sales)

    

        }catch(err){
            

        }finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, [token]);

    if (auth.status === "pending") {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-lg">Your account is pending approval.</div>
            </div>
        );
    }

    if (auth.status === "rejected") {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-lg">Your account has been rejected.</div>
            </div>
        );
    }   


    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-lg">Loading dashboard...</div>
            </div>
        );
    }

    // if (serverError) {
    //     return <ServerError serverError={serverError} />;
    // }

    return (
        <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-4xl font-bold mb-2 text-gray-800">Designer Dashboard</h1>
                <p className="text-gray-600 mb-8">Track your products performance and sales metrics</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Sales Card */}
                    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-700">Total Sales</h2>
                            <div className="bg-green-100 p-3 rounded-full">
                                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M8.16 2.75a.75.75 0 00-.75.75v2a.75.75 0 001.5 0v-2a.75.75 0 00-.75-.75zM12.75 3.5a.75.75 0 00-1.5 0v2a.75.75 0 001.5 0v-2zM10.5 9a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-green-600">{sales.totalSales || 0}</p>
                        <p className="text-sm text-gray-600 mt-1">Transactions</p>
                    </div>

                    {/* Revenue Card */}
                    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-700">Revenue</h2>
                            <div className="bg-blue-100 p-3 rounded-full">
                                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M8.5 10a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM12.5 10a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM16.5 10a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-blue-600">₦{(sales.totalRevenue || 0).toLocaleString()}</p>
                        <p className="text-sm text-gray-600 mt-1">Total Revenue</p>
                    </div>

                    {/* Orders Card */}
                    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-700">Orders</h2>
                            <div className="bg-purple-100 p-3 rounded-full">
                                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042L5.960 9.541a1 1 0 00.894.559h7.294a1 1 0 00.894-.559l2.423-9.694h2.064a1 1 0 000-2h-.5H9.25a1 1 0 00-.894.559L7.607 6H4.25a1 1 0 00-.894.559L1.596 14H0a1 1 0 000 2h.5a1 1 0 00.894.559l1.423 5.694a1 1 0 00.894.559h11.236a1 1 0 00.894-.559l1.423-5.694A1 1 0 0017.5 16h.5a1 1 0 000-2h-1.596l-1.596-6.384a1 1 0 00-.894-.559H8.25a1 1 0 00-.894.559L5.76 13.616h10.24a1 1 0 00.894.559l1.423 5.694z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-purple-600">{orders.totalOrders || 0}</p>
                        <p className="text-sm text-gray-600 mt-1">Total Orders</p>
                    </div>

                    {/* Ratings Card */}
                    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-700">Rating</h2>
                            <div className="bg-yellow-100 p-3 rounded-full">
                                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-yellow-600">{(ratings.averageRating || 0).toFixed(2)}</p>
                        <p className="text-sm text-gray-600 mt-1">Average Rating ({ratings.totalRatings || 0} reviews)</p>
                    </div>

                    {/* Comments Card */}
                    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-700">Comments</h2>
                            <div className="bg-indigo-100 p-3 rounded-full">
                                <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-indigo-600">{comments.totalComments || 0}</p>
                        <p className="text-sm text-gray-600 mt-1">Customer Comments</p>
                    </div>
                </div>

                {/* Additional Stats Section */}
                <div className="mt-12 bg-white p-8 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Performance Summary</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="border-l-4 border-green-500 pl-4">
                            <p className="text-gray-600 font-medium">Average Order Value</p>
                            <p className="text-2xl font-bold text-green-600">
                                ₦{orders.totalOrders > 0 ? ((sales.totalRevenue || 0) / orders.totalOrders).toLocaleString() : 0}
                            </p>
                        </div>
                        <div className="border-l-4 border-blue-500 pl-4">
                            <p className="text-gray-600 font-medium">Customer Engagement</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {((comments.totalComments || 0) + (ratings.totalRatings || 0)) > 0 ? ((comments.totalComments + ratings.totalRatings) / Math.max(orders.totalOrders, 1)).toFixed(2) : 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}




export default Dashboard;