import { useState, useEffect, useContext } from "react";
import { BASE_URL } from "../../Url";
import { AuthContext } from "../marketPlace/hooks/AuthProvider";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faShoppingCart, faCheckCircle, faClock, faDollarSign, faTrophy } from "@fortawesome/free-solid-svg-icons";

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [topSellers, setTopSellers] = useState([]);
    const [topBuyers, setTopBuyers] = useState([]);
    const [pendingOrders, setPendingOrders] = useState([]);
    const [deliveredOrders, setDeliveredOrders] = useState([]);
    const [totalSales, setTotalSales] = useState(0);
    const [sales, setSales] = useState([]);
    const [pendingApprovals, setPendingApprovals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const url = BASE_URL;
    const { auth, isLoggedIn } = useContext(AuthContext);
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    const fetchData = async () => {
        if (!token) {
            setError('Please log in to continue');
            setLoading(false);
            return;
        }

        if (auth.role !== "admin") {
            navigate("/unauthorized");
            return;
        }
        if (auth.role !== "admin") {
            navigate("/unauthorized");
            return;
        }

        try {
            let response = await fetch(`${url}/data`, {
                method: "GET",
                headers: {
                    "authorization": `Bearer ${token}`
                }
            });
            let data = await response.json();

            if (data.success) {
                console.log(data)
                setUsers(data.users || []);
                setTopBuyers(data.topBuyers || []);
                setTopSellers(data.topSellers || []);
                setPendingOrders(data.pendingOrders || []);
                setDeliveredOrders(data.deliveredOrders || []);
                setSales(data.sales || []);
                const total = (data.sales || []).reduce((sum, sale) => sum + (sale.finalAmount || 0), 0);
                setTotalSales(total);
            } else {
                setError('Failed to fetch data');
            }
        } catch (err) {
            setError('An error occurred while fetching data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-red-500 text-xl">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Total Users */}
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-full">
                                <FontAwesomeIcon icon={faUsers} className="text-blue-600 text-2xl" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
                                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                            </div>
                        </div>
                    </div>

                    {/* Total Sales */}
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-full">
                                <FontAwesomeIcon icon={faDollarSign} className="text-green-600 text-2xl" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-700">Total Sales</h3>
                                <p className="text-2xl font-bold text-gray-900">${totalSales.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Top Seller */}
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center">
                            <div className="p-3 bg-yellow-100 rounded-full">
                                <FontAwesomeIcon icon={faTrophy} className="text-yellow-600 text-2xl" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-700">Top Seller</h3>
                                <p className="text-lg font-bold text-gray-900">
                                    {topSellers.length > 0 ? `${topSellers[0].name} (${topSellers[0].totalSalesCount} sales)` : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Top Buyer */}
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center">
                            <div className="p-3 bg-purple-100 rounded-full">
                                <FontAwesomeIcon icon={faShoppingCart} className="text-purple-600 text-2xl" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-700">Top Buyer</h3>
                                <p className="text-lg font-bold text-gray-900">
                                    {topBuyers.length > 0 ? `${topBuyers[0].lname + " " + topBuyers[0].fname} (${topBuyers[0].totalSalesCount} orders)` : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Pending Orders */}
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center">
                            <div className="p-3 bg-orange-100 rounded-full">
                                <FontAwesomeIcon icon={faClock} className="text-orange-600 text-2xl" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-700">Pending Orders</h3>
                                <p className="text-2xl font-bold text-gray-900">{pendingOrders.length}</p>
                            </div>
                        </div>
                    </div>

                    {/* Delivered Orders */}
                    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-full">
                                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-2xl" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-700">Delivered Orders</h3>
                                <p className="text-2xl font-bold text-gray-900">{deliveredOrders.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
