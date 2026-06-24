
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
  Send,
  Currency,
  Clock,
  Check,
  XCircle,
  RotateCcw
} from "lucide-react";

const VendorOrderDetails = () => {
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sendingItem, setSendingItem] = useState(null);
    const [itemAvailability, setItemAvailability] = useState({});

    const { id } = useParams();
    const url = `${BASE_URL}/vendorOrderDetails/${id}`;
    const confirmItemAvailableUrl = `${BASE_URL}/confirmItemAvailable`

    const fetchOrderDetails = async () => {
        try {
            let response = await CustomFetch(url, {
                method: "GET"
            });

            if (response.ok) {
                const details = await response.json();
                console.log("API Response:", details);
                
                // Your API returns {success: true, order: {...}}
                setOrderDetails(details.vendorItems);
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

    const handleProductAvailability = (itemId, available) => {
        setItemAvailability(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                hasProduct: available
            }
        }));
    };

    const handleQuantityAvailability = (itemId, available) => {
        setItemAvailability(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                fullQuantityAvailable: available
            }
        }));
    };

    const handleAvailableQuantityChange = (itemId, quantity) => {
        setItemAvailability(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                availableQuantity: quantity
            }
        }));
    };

    const handleItemSent = async (itemId) => {
    };

    // const submitAvailability = async (
    //     itemId,
    //     hasProduct,
    //     availableQuantity
    //     ) => {

    //     const response = await CustomFetch(
    //         `${BASE_URL}/designer/check-product`,
    //         {
    //         method: "PUT",
    //         headers: {
    //             "Content-Type": "application/json"
    //         },
    //         body: JSON.stringify({
    //             orderId: id,
    //             itemId,
    //             hasProduct,
    //             availableQuantity
    //         })
    //         }
    //     );

    //     const result = await response.json();

    //     if (response.ok) {
    //         fetchOrderDetails();
    //     }

    //     console.log(result);
    //     };

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="h-12 w-12 animate-spin text-indigo-600 mx-auto" />
                    <p className="mt-4 text-gray-600 font-medium">Fetching order details...</p>
                    <p className="text-sm text-gray-400 mt-1">Please wait while we load the order information</p>
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
                        to="/designer/orders" 
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
        confirmed: "bg-sky-100 text-sky-800",
        unavailable: "bg-gray-100 text-gray-800",
        in_transit: "bg-purple-100 text-purple-800",
        delivered: "bg-green-100 text-green-800",
        completed: "bg-emerald-100 text-emerald-800",
        returned: "bg-orange-100 text-orange-800",
        cancelled: "bg-red-100 text-red-800",
    };

    const orderStatusIcons = {
        pending: Package,
        confirmed: CheckCircle,
        unavailable: AlertCircle,
        in_transit: Truck,
        delivered: CheckCircle,
        returned: RotateCcw,
        completed: CheckCircle,
        cancelled: AlertCircle
        };

        const itemsWithImages = orderDetails?.map(item => {
            const matchingProduct = orderDetails.products?.find(
                product => product.productId?._id === item.productId
            );

        return {
            ...item,
            image: matchingProduct?.productId?.productImages?.[0] || null
            };
        });


    // Payment status configurations
    const paymentStatusConfig = {
        paid: {
            color: "bg-green-100 text-green-800",
            icon: CheckCircle,
            label: "Paid"
        },
        pending: {
            color: "bg-yellow-100 text-yellow-800",
            icon: Clock,
            label: "Pending"
        },
        failed: {
            color: "bg-red-100 text-red-800",
            icon: XCircle,
            label: "Failed"
        },
        refunded: {
            color: "bg-gray-100 text-gray-800",
            icon: Currency,
            label: "Refunded"
        }
    };

    const StatusIcon = orderStatusIcons[orderDetails.orderStatus?.toLowerCase()] || Package;

    // Calculate summary statistics
    const totalItems = orderDetails.items?.reduce((totalCount, item) => {
        return totalCount + item.quantity
    }, 0);
    const totalAmount = orderDetails.amount || 0;
    const paidItems = orderDetails.items?.reduce((total, item) => {
        return item.status === "completed" 
        ? total + item.quantity
        : total;
    }, 0);
    const sentItems = orderDetails.items?.reduce((total, item) => {
        return item.status === "in_transit" || item.status === "delivered" || item.status === "completed"
            ? total + item.quantity
            : total;
        }, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <Link 
                    to="/designer/orders" 
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
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 rounded-lg">
                                    <CreditCard className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Amount</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {orderDetails.Currency || 'NGN'} {totalAmount?.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 rounded-lg">
                                    <Package className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Items</p>
                                    <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-50 rounded-lg">
                                    <Currency className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Paid Items</p>
                                    <p className="text-2xl font-bold text-green-600">{paidItems}/{totalItems}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Send className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Items Sent</p>
                                    <p className="text-2xl font-bold text-blue-600">{sentItems}/{totalItems}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Customer Information */}
                    {/* {orderDetails.customer && (
                        <div className="p-6 border-b border-gray-100 bg-gray-50">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Customer Information</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="font-medium text-gray-900">{orderDetails.customer.name || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="font-medium text-gray-900">{orderDetails.customer.email || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Phone</p>
                                    <p className="font-medium text-gray-900">{orderDetails.customer.phone || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    )} */}
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
                        {itemsWithImages.map((item, index) => {
                            const PaymentIcon = paymentStatusConfig[item.paymentStatus?.toLowerCase()]?.icon || Currency;
                            const paymentConfig = paymentStatusConfig[item.paymentStatus?.toLowerCase()] || paymentStatusConfig.pending;
                            
                            return (
                                <div key={item._id || item.productId || index} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex flex-col lg:flex-row gap-6">
                                        {/* Product Image */}
                                        <div className="flex-shrink-0">
                                            <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center overflow-hidden">
                                                {item.image ? (
                                                    <Link to={`/productdetails/${item.productId}`}>
                                                    <img 
                                                        src={item.image} 
                                                        alt={item.name}
                                                        className="w-full h-full object-cover rounded-xl"
                                                    />
                                                    </Link>
                                                ) : (
                                                    <Link>
                                                        <Package className="h-8 w-8 text-gray-400" />
                                                    </Link>
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
                                                    {orderDetails.Currency || 'NGN'} {(item.price * item.quantity)?.toLocaleString() || (orderDetails.amount / totalItems)?.toLocaleString()}
                                                </p>
                                            </div>
                                            
                                            {/* Specifications */}
                                            <div className="flex flex-wrap gap-4 mb-4">
                                                {item.size && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-medium text-gray-500">SIZE:</span>
                                                        <span className="px-2 py-1 bg-gray-100 rounded-md text-sm font-semibold">{item.size.toUpperCase()}</span>
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
                                            </div>
                                            
                                            {/* Status Badges Row */}
                                            <div className="flex flex-wrap gap-3 mb-4">
                                                {/* Payment Status Badge */}
                                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${paymentConfig.color}`}>
                                                    <PaymentIcon className="h-3 w-3" />
                                                    <span>{paymentConfig.label}</span>
                                                </div>
                                                
                                                {/* Sent Status Badge */}
                                                {item.status === 'in_transit' && (
                                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        <truck className="h-3 w-3" />
                                                        <span>In Transit</span>
                                                    </div>
                                                )}
                                                
                                                {/* Delivery Status Badge */}
                                                {item.status === 'delivered' && (
                                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <CheckCircle className="h-3 w-3" />
                                                        <span>Delivered</span>
                                                    </div>
                                                )}
                                                {item.status === 'unavailable' && (
                                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <AlertCircle className="h-3 w-3" />
                                                        <span>Returned</span>
                                                    </div>
                                                )}

                                                {item.status === 'returned' && (
                                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <AlertCircle className="h-3 w-3" />
                                                        <span>Returned</span>
                                                    </div>
                                                )}

                                                {item.status === 'completed' && (
                                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <CheckCircle className="h-3 w-3" />
                                                        <span>completed</span>
                                                    </div>
                                                )}
                                            </div>

                                            {!itemAvailability[item._id]?.hasProduct && (
                                                <div className="mt-4 p-4 rounded-lg bg-gray-50 flex items-center justify-between">
                                                    <h3 className="font-medium mb-3">
                                                        Do you have this product?
                                                    </h3>

                                                    <div className="flex gap-4">
                                                        <button
                                                            onClick={() =>
                                                                handleProductAvailability(item._id, true)
                                                            }
                                                            className="px-4 py-2 bg-green-600 text-white rounded-lg"
                                                        >
                                                            Yes
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                handleItemNotAvailable(item._id)
                                                            }
                                                            className="px-4 py-2 bg-red-600 text-white rounded-lg"
                                                        >
                                                            No
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {itemAvailability[item._id]?.hasProduct &&
                                            !itemAvailability[item._id]?.fullQuantityAvailable && (
                                                <div className="mt-4 p-4 border rounded-lg bg-blue-50">
                                                    <h3 className="font-medium mb-3">
                                                        Is the required quantity ({item.quantity}) available?
                                                    </h3>

                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() =>
                                                                handleQuantityAvailability(item._id, true)
                                                            }
                                                            className="px-4 py-2 bg-green-600 text-white rounded-lg"
                                                        >
                                                            Yes
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                handleQuantityAvailability(item._id, false)
                                                            }
                                                            className="px-4 py-2 bg-orange-600 text-white rounded-lg"
                                                        >
                                                            No
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {itemAvailability[item._id]?.hasProduct &&
                                            itemAvailability[item._id]?.fullQuantityAvailable === false && (
                                                <div className="mt-4 p-4 border rounded-lg bg-yellow-50">
                                                    <label className="block text-sm font-medium mb-2">
                                                        Quantity Available
                                                    </label>

                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={item.quantity}
                                                        value={
                                                            itemAvailability[item._id]?.availableQuantity || ""
                                                        }
                                                        onChange={(e) =>
                                                            handleAvailableQuantityChange(
                                                                item._id,
                                                                Number(e.target.value)
                                                            )
                                                        }
                                                        className="w-full border rounded-lg p-2"
                                                    />

                                                    <button
                                                        className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg"
                                                        onClick={() => {
                                                            const qty =
                                                                itemAvailability[item._id]
                                                                    ?.availableQuantity || 0;

                                                            if (qty <= 0) {
                                                                handleItemNotAvailable(item._id);
                                                                return;
                                                            }

                                                            console.log({
                                                                itemId: item._id,
                                                                availableQuantity: qty
                                                            });

                                                            // send to backend
                                                        }}
                                                    >
                                                        Confirm Available Quantity
                                                    </button>
                                                </div>
                                            )}
                                            
                                            {/* Action Button - Only show if payment is confirmed and item not sent */}
                                            {/* {itemAvailable && item.paymentStatus === 'paid' && item.sentStatus !== 'sent' && (
                                                <button
                                                    onClick={() => handleItemSent(item._id || item.productId || index)}
                                                    disabled={sendingItem === (item._id || item.productId || index)}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {sendingItem === (item._id || item.productId || index) ? (
                                                        <>
                                                            <Loader className="h-4 w-4 animate-spin" />
                                                            Sending...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Send className="h-4 w-4" />
                                                            Mark as Sent
                                                        </>
                                                    )}
                                                </button>
                                            )} */}
                                            
                                            {/* Item Already Sent Message
                                            {itemAvailable && item.status === 'in_transit' && (
                                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200">
                                                    <CheckCircle className="h-4 w-4" />
                                                    <span className="text-sm font-medium">Item has been sent to customer</span>
                                                </div>
                                            )} */}
                                            
                                            {/* Payment Required Message
                                            {itemAvailable && item.paymentStatus !== 'paid' && item.sentStatus !== 'sent' && (
                                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-200">
                                                    <Clock className="h-4 w-4" />
                                                    <span className="text-sm font-medium">Awaiting payment confirmation</span>
                                                </div>
                                            )} */}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Delivery Information Card */}
                <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Truck className="h-5 w-5 text-indigo-600" />
                            Shipping Information
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="flex items-start gap-3">
                            <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-gray-700 font-medium">Delivery Address:</p>
                                <p className="text-gray-600 mt-1">
                                    {orderDetails.shippingAddress || "No shipping address provided"}
                                </p>
                                {orderDetails.trackingNumber && (
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                        <p className="text-sm text-gray-500">Tracking Number:</p>
                                        <p className="text-sm font-mono text-indigo-600">{orderDetails.trackingNumber}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Timeline */}
                {orderDetails.timeline && orderDetails.timeline.length > 0 && (
                    <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Clock className="h-5 w-5 text-indigo-600" />
                                Order Timeline
                            </h2>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                {orderDetails.timeline.map((event, idx) => (
                                    <div key={idx} className="flex gap-3">
                                        <div className="relative">
                                            <div className="w-3 h-3 mt-1.5 rounded-full bg-indigo-500"></div>
                                            {idx !== orderDetails.timeline.length - 1 && (
                                                <div className="absolute top-4 left-1.5 w-0.5 h-full bg-gray-200"></div>
                                            )}
                                        </div>
                                        <div className="flex-1 pb-4">
                                            <p className="font-medium text-gray-900">{event.status}</p>
                                            <p className="text-sm text-gray-500">{new Date(event.date).toLocaleString()}</p>
                                            {event.note && <p className="text-sm text-gray-600 mt-1">{event.note}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorOrderDetails;