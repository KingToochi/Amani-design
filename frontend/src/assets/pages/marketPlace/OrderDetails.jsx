import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { BASE_URL } from "../../Url";
import CustomFetch from "../../hooks/UseFetch";
import ServerError from "../../components/ServerError";
import { 
  Loader, 
  ShoppingBag, 
  AlertCircle, 
  CheckCircle, 
  Package, 
  CreditCard, 
  Truck,
  MapPin,
  Calendar,
  ArrowLeft,
  Receipt,
  CircleCheckBig,
  PackageCheck 
} from "lucide-react";

const OrderDetails = () => {
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [confirmingItem, setConfirmingItem] = useState(null);

    const { id } = useParams();
    const url = `${BASE_URL}/customerOrderDetails/${id}`;
    const confirmingItemUrl = `${BASE_URL}/confirmItemReceived`

    const fetchOrderDetails = async () => {
        try {
            let response = await CustomFetch(url, {
                method: "GET"
            });

            if (response.ok) {
                const details = await response.json();
                console.log("API Response:", details);
                
                // Fix: Your API returns {success: true, order: {...}}
                // NOT {success: true, data: {order, products}}
                setOrderDetails(details.order);
                setError(null);
            } else {
                setError({ message: "Unable to fetch order details" });
            }
        } catch (error) {
            console.error("Fetch error:", error);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    const itemsWithImages = orderDetails?.items?.map(item => {
        const matchingProduct = orderDetails.products?.find(
            product => product.productId?._id === item.productId
        );

    return {
        ...item,
        image: matchingProduct?.productId?.productImages?.[0] || null
    };
});

    const handleItemReceived = async (itemId) => {

        const data = [itemId, id];

        try {
            let response = await CustomFetch(confirmingItemUrl, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            console.log(result);

        } catch (error) {
            console.error(error);
        }
        // setConfirmingItem(itemId);
        
        // // Add your API call here to confirm item receipt
        // setTimeout(() => {
        //     setConfirmingItem(null);
        //     // Show success message
        //     alert("Item marked as received!");
        // }, 1000);
    };

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="h-12 w-12 animate-spin text-indigo-600 mx-auto" />
                    <p className="mt-4 text-gray-600 font-medium">Fetching your order details...</p>
                    <p className="text-sm text-gray-400 mt-1">Please wait while we load your information</p>
                </div>
            </div>
        );
    }

    if (error) {
        return <ServerError />;
    }

    if (!orderDetails) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-700 mb-2">Order Not Found</h2>
                    <p className="text-gray-500 mb-6">We couldn't find the order you're looking for.</p>
                    <Link 
                        to="/orders" 
                        className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Orders
                    </Link>
                </div>
            </div>
        );
    }

    // Status color mapping
    const orderStatusColors = {
        pending: "bg-yellow-100 text-yellow-800",
        processing: "bg-blue-100 text-blue-800",
        shipped: "bg-purple-100 text-purple-800",
        delivered: "bg-green-100 text-green-800",
        cancelled: "bg-red-100 text-red-800"
    };

    const orderStatusIcons = {
        pending: Package,
        processing: Truck,
        shipped: Truck,
        delivered: CheckCircle,
        cancelled: AlertCircle
    };

    const StatusIcon = orderStatusIcons[orderDetails.orderStatus?.toLowerCase()] || Package;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <Link 
                    to="/customer-orders" 
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-6 transition-colors group"
                >
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Orders
                </Link>

                {/* Order Header Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                    <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <div className="flex items-center gap-2 text-indigo-100 mb-2">
                                    <Receipt className="h-5 w-5" />
                                    <span className="text-sm font-medium">Order ID</span>
                                </div>
                                <h1 className="text-2xl font-bold text-white">#{orderDetails._id?.slice(-8) || id?.slice(-8)}</h1>
                            </div>
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${orderStatusColors[orderDetails.orderStatus?.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
                                <StatusIcon className="h-4 w-4" />
                                <span className="font-medium capitalize">{orderDetails.orderStatus || 'Pending'}</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Order Summary */}
                    <div className="p-6 border-b border-gray-100">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 rounded-lg">
                                    <CreditCard className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Amount</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {orderDetails.currency || 'NGN'} {orderDetails.amount?.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 rounded-lg">
                                    <Package className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Items</p>
                                    <p className="text-2xl font-bold text-gray-900">{orderDetails.items?.reduce((totalCount,item)=> {
                                        return totalCount + item.quantity
                                    },0)|| 0}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 rounded-lg">
                                    <Calendar className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Order Date</p>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {new Date(orderDetails.createdAt || Date.now()).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <ShoppingBag className="h-5 w-5 text-indigo-600" />
                            Order Items
                        </h2>
                    </div>
                    
                    <div className="divide-y divide-gray-100">
                        {/* Use items array from your API response */}
                        {(itemsWithImages || []).map((item, index) => {
                            return (
                                <div key={item._id || item.productId || index} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex flex-col sm:flex-row gap-6">
                                        {/* Product Image Placeholder */}
                                        <div className="flex-shrink-0">
                                            <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                                                {item.image ? (
                                                    <img 
                                                        src={item.image} 
                                                        alt={item.name}
                                                        className="w-full h-full object-cover rounded-xl"
                                                    />
                                                ) : (
                                                    <Package className="h-8 w-8 text-gray-400" />
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Product Details */}
                                        <div className="flex-1">
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">{item.name || `Item ${index + 1}`}</h3>
                                                    {item.productId && (
                                                        <p className="text-sm text-gray-500 mt-1">SKU: {typeof item.productId === 'string' ? item.productId.slice(-6) : item.productId?._id?.slice(-6) || 'N/A'}</p>
                                                    )}
                                                </div>
                                                <p className="text-2xl font-bold text-indigo-600">
                                                    {orderDetails.currency || 'NGN'} {item.price * item.quantity?.toLocaleString()}
                                                </p>
                                            </div>
                                            
                                            {/* Specifications */}
                                            <div className="flex flex-wrap gap-4 mb-4">
                                                {item.size && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-medium text-gray-500">SIZE:</span>
                                                        <span className="px-2 py-1 bg-gray-100 rounded-md text-sm font-semibold">{item.size}</span>
                                                    </div>
                                                )}
                                                {item.color && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-medium text-gray-500">COLOR:</span>
                                                        <div className="flex items-center gap-2">
                                                            <div 
                                                                className="w-4 h-4 rounded-full border border-gray-300"
                                                                style={{ backgroundColor: item.color.toLowerCase() }}
                                                            />
                                                            <span className="text-sm">{item.color}</span>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium text-gray-500">QUANTITY:</span>
                                                    <span className="font-semibold text-gray-900">{item.quantity || 1}</span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium text-gray-500">status:</span>
                                                    <span className="font-semibold text-gray-900">{item?.status || "pending"}</span>
                                                </div>
                                            </div>
                                            
                                            {/* Action Button */}
                                            {!confirmingItem ? (
                                            <button
                                                onClick={() => handleItemReceived(item._id || item.productId || index)}
                                                disabled={confirmingItem === (item._id || item.productId || index)}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <PackageCheck  className="h-4 w-4" />
                                                        Confirm Item Received
                                            </button>
                                            ) : (
                                                <div>
                                                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all transform hover:scale-105"><CircleCheckBig  className="h-4 w-4" />
                                                    Item Received
                                                    </span>
                                                    <h1 className="text-sm">Please inspect your order on delivery. You have 24 hours to report any issues. If there’s a problem, visit our Support Center for assistance.
                                                    </h1>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Delivery Information Card */}
                <div className="mt-6 pb-10 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Truck className="h-5 w-5 text-indigo-600" />
                            Delivery Information
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="text-gray-700">
                                    {orderDetails.shippingAddress || "Delivery address will be updated soon"}
                                </p>
                                <p className="text-sm text-gray-500 mt-2">
                                    Estimated delivery: {orderDetails.orderStatus === 'delivered' ? 'Delivered' : '2-3 business days'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;