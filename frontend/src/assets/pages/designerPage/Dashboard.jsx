import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../marketPlace/hooks/AuthProvider";  
import {BASE_URL} from "../../Url";

const Dashboard = () => {
    const url = BASE_URL;
    const { auth } = useContext(AuthContext);
    const token = localStorage.getItem("token");
    const [sales, setSales] = useState({});
    const [orders, setOrders] = useState({});
    const [comments, setComments] = useState({});
    const [ratings, setRatings] = useState({});
    const [loading, setLoading] = useState(true);
    const fetchData = async () => {
        try {
            if (!token) return;
        if(auth?.role !== "vendor" || auth?.role !== "designer") return;

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
        }
        console.log(data);

        }catch(err){

        }finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, [token]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-lg">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold mb-6 text-center">Designer Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-2">Sales</h2>
                    <p className="text-2xl font-bold text-green-600">{sales.total || 0}</p>
                    <p className="text-sm text-gray-600">Total Sales</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-2">Orders</h2>
                    <p className="text-2xl font-bold text-blue-600">{orders.total || 0}</p>
                    <p className="text-sm text-gray-600">Total Orders</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-2">Comments</h2>
                    <p className="text-2xl font-bold text-yellow-600">{comments.total || 0}</p>
                    <p className="text-sm text-gray-600">Total Comments</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-2">Ratings</h2>
                    <p className="text-2xl font-bold text-purple-600">{ratings.average || 0}</p>
                    <p className="text-sm text-gray-600">Average Rating</p>
                </div>
            </div>
        </div>
    );
}




export default Dashboard;