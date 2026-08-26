import { useState, useEffect, useContext } from "react";
import { BASE_URL } from "../../Url";
import { AuthContext } from "../../hooks/AuthProvider";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faShoppingCart, faCheckCircle, faClock, faDollarSign, faTrophy } from "@fortawesome/free-solid-svg-icons";
import CustomFetch from "../../hooks/UseFetch";
const AdminDashboard = () => {
    const [totalUsers, setTotalUsers] = useState(0);
    const [topSellers, setTopSellers] = useState([]);
    const [topBuyers, setTopBuyers] = useState([]);
    const [pendingOrders, setPendingOrders] = useState(0);
    const [deliveredOrders, setDeliveredOrders] = useState(0);
    const [totalSales, setTotalSales] = useState(0);
    const [totalOrders, setTotalOrders] = useState(0);
    const [pendingApprovals, setPendingApprovals] = useState(0);
    const [totalProducts, setTotalProducts] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const url = `${BASE_URL}/data`;
    const { auth, isLoggedIn } = useContext(AuthContext);
    const navigate = useNavigate();

    const fetchData = async () => {
        if (auth.role !== "admin") {
            navigate("/unauthorized");
            return;
        }

        try {
            let response = await CustomFetch(url, {
                method: "GET",
            });
            let data = await response.json();

            if (data.success) {
                console.log(data)
                setTotalUsers(data.totalUsers || 0);
                setTopBuyers(data.topBuyers || data.topBuyer || []);
                setTopSellers(data.topSellers || data.topSeller || []);
                setPendingOrders(data.pendingOrders || 0);
                setDeliveredOrders(data.deliveredOrders || 0);
                setTotalSales(data.totalSales || 0);
                setTotalOrders(data.totalOrders || 0);
                setTotalProducts(data.totalProducts || 0);
                setPendingApprovals(data.pendingApprovals || data.pendingApproval || 0);
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
                    <Link to="/admin" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow block">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-full">
                                <FontAwesomeIcon icon={faUsers} className="text-blue-600 text-2xl" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
                                <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                            </div>
                        </div>
                    </Link>

                    {/* Total Sales */}
                    <Link to="/admin" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow block">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-full">
                                <FontAwesomeIcon icon={faDollarSign} className="text-green-600 text-2xl" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-700">Total Sales</h3>
                                <p className="text-2xl font-bold text-gray-900">${totalSales.toFixed(2)}</p>
                            </div>
                        </div>
                    </Link>

                    {/* Top Seller */}
                    <Link to="/admin" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow block">
                        <div className="flex items-center">
                            <div className="p-3 bg-yellow-100 rounded-full">
                                <FontAwesomeIcon icon={faTrophy} className="text-yellow-600 text-2xl" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-700">Top Seller</h3>
                                <p className="text-lg font-bold text-gray-900">
                                    {topSellers.length > 0 ? `${topSellers[0].name || (topSellers[0].fname ? topSellers[0].fname + ' ' + (topSellers[0].lname||'') : 'Unknown')} (${topSellers[0].totalSales ?? topSellers[0].totalSalesCount ?? 0} sales)` : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </Link>

                    {/* Top Buyer */}
                    <Link to="/admin" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow block">
                        <div className="flex items-center">
                            <div className="p-3 bg-purple-100 rounded-full">
                                <FontAwesomeIcon icon={faShoppingCart} className="text-purple-600 text-2xl" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-700">Top Buyer</h3>
                                <p className="text-lg font-bold text-gray-900">
                                    {topBuyers.length > 0 ? `${topBuyers[0].name || (topBuyers[0].lname && topBuyers[0].fname ? topBuyers[0].lname + ' ' + topBuyers[0].fname : (topBuyers[0].fname || 'Unknown'))} (${topBuyers[0].totalSales ?? topBuyers[0].totalSalesCount ?? 0} orders)` : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </Link>

                    {/* Total Orders */}
                    <Link to="/admin" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow block">
                        <div className="flex items-center">
                            <div className="p-3 bg-indigo-100 rounded-full">
                                <FontAwesomeIcon icon={faShoppingCart} className="text-indigo-600 text-2xl" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-700">Total Orders</h3>
                                <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                            </div>
                        </div>
                    </Link>

                    {/* Total Products */}
                    <Link to="/admin" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow block">
                        <div className="flex items-center">
                            <div className="p-3 bg-teal-100 rounded-full">
                                <FontAwesomeIcon icon={faTrophy} className="text-teal-600 text-2xl" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-700">Total Products</h3>
                                <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
                            </div>
                        </div>
                    </Link>

                    {/* Pending Orders */}
                    <Link to="/admin" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow block">
                        <div className="flex items-center">
                            <div className="p-3 bg-orange-100 rounded-full">
                                <FontAwesomeIcon icon={faClock} className="text-orange-600 text-2xl" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-700">Pending Orders</h3>
                                <p className="text-2xl font-bold text-gray-900">{pendingOrders}</p>
                            </div>
                        </div>
                    </Link>

                    {/* Pending Approvals */}
                    <Link to="/admin" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow block">
                        <div className="flex items-center">
                            <div className="p-3 bg-red-100 rounded-full">
                                <FontAwesomeIcon icon={faClock} className="text-red-600 text-2xl" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-700">Pending Approvals</h3>
                                <p className="text-2xl font-bold text-gray-900">{pendingApprovals}</p>
                            </div>
                        </div>
                    </Link>

                    {/* Delivered Orders */}
                    <Link to="/admin" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow block">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-full">
                                <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 text-2xl" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-700">Delivered Orders</h3>
                                <p className="text-2xl font-bold text-gray-900">{deliveredOrders}</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
