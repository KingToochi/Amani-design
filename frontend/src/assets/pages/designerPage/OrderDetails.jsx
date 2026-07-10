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
    const [itemAvailability, setItemAvailability] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [sendingItem, setSendingItem] = useState(null);

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
                
                setOrderDetails(details.vendorOrder);
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
                hasProduct: available,
                confirmed: false
            }
        }));
    };

    const handleQuantityAvailability = (itemId, available) => {
        setItemAvailability(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                fullQuantityAvailable: available,
                confirmed: available,
                availableQuantity: available ? prev[itemId]?.availableQuantity || 0 : 0
            }
        }));
    };

    const handleAvailableQuantityChange = (itemId, quantity) => {
        setItemAvailability(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                availableQuantity: quantity,
                confirmed: false
            }
        }));
    };

    // Handle "No" for product availability
    const handleItemNotAvailable = (itemId) => {
        setItemAvailability(prev => ({
            ...prev,
            [itemId]: {
                hasProduct: false,
                fullQuantityAvailable: false,
                availableQuantity: 0,
                confirmed: true
            }
        }));
    };

    // Handle "No" for quantity availability
    const handleQuantityNotAvailable = (itemId) => {
        setItemAvailability(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                hasProduct: true,
                fullQuantityAvailable: false,
                availableQuantity: 0,
                confirmed: true
            }
        }));
    };

    // Submit all confirmations
    const submitAllConfirmations = async () => {
        // Reset states
        setSubmitError(null);
        setSubmitSuccess(false);
        setIsSubmitting(true);

        // Check if all items have been confirmed
        const items = orderDetails.item || [];
        const unconfirmedItems = items.filter(item => {
            const availability = itemAvailability[item._id];
            return !availability || !availability.confirmed;
        });

        if (unconfirmedItems.length > 0) {
            setSubmitError(`Please confirm availability for all items. ${unconfirmedItems.length} item(s) pending confirmation.`);
            setIsSubmitting(false);
            return;
        }

        // Prepare data for submission
        const submissionData = {
            orderId: id,
            items: items.map(item => {
                const availability = itemAvailability[item._id];
                return {
                    itemId: item._id,
                    productId: item.productId,
                    hasProduct: availability.hasProduct,
                    fullQuantityAvailable: availability.fullQuantityAvailable,
                    availableQuantity: availability.availableQuantity || 0,
                    originalQuantity: item.quantity
                };
            })
        };

        try {
            const response = await CustomFetch(
                `${BASE_URL}/confirmItemAvailability`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(submissionData)
                }
            );

            const result = await response.json();

            if (response.ok) {
                setSubmitSuccess(true);
                // Refresh order details to get updated status
                await fetchOrderDetails();
                // Reset availability state
                setItemAvailability({});
                setTimeout(() => {
                    setSubmitSuccess(false);
                }, 5000);
            } else {
                setSubmitError(result.message || "Failed to submit confirmations");
            }
        } catch (error) {
            console.error("Submission error:", error);
            setSubmitError("An error occurred while submitting confirmations");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Check if all items are confirmed
    const areAllItemsConfirmed = () => {
        const items = orderDetails?.item || [];
        if (items.length === 0) return false;
        
        return items.every(item => {
            const availability = itemAvailability[item._id];
            return availability && availability.confirmed === true;
        });
    };

    // Check if any item is marked as unavailable
    const hasUnavailableItems = () => {
        const items = orderDetails?.item || [];
        return items.some(item => {
            const availability = itemAvailability[item._id];
            return availability && availability.hasProduct === false;
        });
    };

    const handleItemSent = async (itemId) => {
        setSubmitError(null);
        setSubmitSuccess(false);
        setSendingItem(itemId);

        try {
            const response = await CustomFetch(`${BASE_URL}/markItemAsSent`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ orderId: id, itemId })
            });

            const result = await response.json();

            if (response.ok) {
                setSubmitSuccess(result.message || "Item marked as sent");
                await fetchOrderDetails();
            } else {
                setSubmitError(result.message || "Failed to update item status");
            }
        } catch (error) {
            console.error("Send item error:", error);
            setSubmitError("An error occurred while updating the item status");
        } finally {
            setSendingItem(null);
        }
    };

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    useEffect(() => {
        if (!orderDetails?.item) return;

        const initialAvailability = {};
        orderDetails.item.forEach((item) => {
            if (item.availabilityConfirmed) {
                initialAvailability[item._id] = {
                    hasProduct: item.availability?.hasProduct ?? false,
                    fullQuantityAvailable: item.availability?.fullQuantityAvailable ?? false,
                    availableQuantity: item.availability?.availableQuantity ?? 0,
                    confirmed: true,
                };
            }
        });

        setItemAvailability(initialAvailability);
    }, [orderDetails]);

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
    const itemsWithImages = orderDetails?.item?.map(item => {
        const matchingProduct = orderDetails?.image?.find(
            product => product._id?.toString() === item.productId?.toString()
        );

        return {
            ...item,
            image: matchingProduct?.productImages?.[0] || null
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
    const totalItems = orderDetails.item?.reduce((totalCount, item) => {
        return totalCount + item.quantity
    }, 0);
    const totalAmount = orderDetails.amount || 0;
    const paidItems = orderDetails.item?.reduce((total, item) => {
        return item.status === "completed" 
        ? total + item.quantity
        : total;
    }, 0);
    const sentItems = orderDetails.item?.reduce((total, item) => {
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
                    <div className="p-6 border-b border-gray-100 bg-gray-50">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Customer Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Name</p>
                                <p className="font-medium text-gray-900">{orderDetails.customerName || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Phone</p>
                                <p className="font-medium text-gray-900">{orderDetails.customerPhone || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Shipping Address</p>
                                <p className="font-medium text-gray-900">{orderDetails.shippingAddress || 'No shipping address provided'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <ShoppingBag className="h-5 w-5 text-indigo-600" />
                            Order Items
                        </h2>
                        {/* Submit Button */}
                        <button
                            onClick={submitAllConfirmations}
                            disabled={isSubmitting || !areAllItemsConfirmed()}
                            className={`inline-flex items-center gap-2 px-6 py-2 rounded-lg text-white font-medium transition-all transform hover:scale-105 ${
                                areAllItemsConfirmed() && !isSubmitting
                                    ? 'bg-indigo-600 hover:bg-indigo-700'
                                    : 'bg-gray-400 cursor-not-allowed'
                            }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader className="h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4" />
                                    Submit Confirmations
                                </>
                            )}
                        </button>
                    </div>
                    
                    {/* Submit Status Messages */}
                    {submitError && (
                        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-red-800">Submission Error</p>
                                <p className="text-sm text-red-700">{submitError}</p>
                            </div>
                        </div>
                    )}
                    
                    {submitSuccess && (
                        <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-green-800">Success!</p>
                                <p className="text-sm text-green-700">All item confirmations have been submitted successfully.</p>
                            </div>
                        </div>
                    )}
                    
                    <div className="divide-y divide-gray-100">
                        {itemsWithImages.map((item, index) => {
                            const PaymentIcon = paymentStatusConfig[item.paymentStatus?.toLowerCase()]?.icon || Currency;
                            const paymentConfig = paymentStatusConfig[item.paymentStatus?.toLowerCase()] || paymentStatusConfig.pending;
                            const availability = itemAvailability[item._id];
                            
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
                                                    {/* Confirmation Status Badge */}
                                                    {availability?.confirmed && (
                                                        <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                                                            <CheckCircle className="h-3 w-3" />
                                                            Confirmed
                                                        </span>
                                                    )}
                                                    {availability && !availability.confirmed && (
                                                        <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                                            <Clock className="h-3 w-3" />
                                                            Pending Confirmation
                                                        </span>
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
                                                        <Truck className="h-3 w-3" />
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
                                                        <span>Completed</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Availability Confirmation Section */}
                                            {!itemAvailability[item._id]?.hasProduct && (
                                                <div className="mt-4 p-4 rounded-lg bg-gray-50 flex items-center justify-between">
                                                    <h3 className="font-medium">
                                                        Do you have this product?
                                                    </h3>

                                                    <div className="flex gap-4">
                                                        <button
                                                            onClick={() =>
                                                                handleProductAvailability(item._id, true)
                                                            }
                                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                        >
                                                            Yes
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                handleItemNotAvailable(item._id)
                                                            }
                                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
                                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                                        >
                                                            Yes
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                handleQuantityNotAvailable(item._id)
                                                            }
                                                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
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
                                                        className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                                        onClick={() => {
                                                            const qty =
                                                                itemAvailability[item._id]
                                                                    ?.availableQuantity || 0;

                                                            if (qty <= 0) {
                                                                handleItemNotAvailable(item._id);
                                                                return;
                                                            }

                                                            setItemAvailability(prev => ({
                                                                ...prev,
                                                                [item._id]: {
                                                                    ...prev[item._id],
                                                                    hasProduct: true,
                                                                    fullQuantityAvailable: false,
                                                                    availableQuantity: qty,
                                                                    confirmed: true
                                                                }
                                                            }));
                                                        }}
                                                    >
                                                        Confirm Available Quantity
                                                    </button>
                                                </div>
                                            )}
                                            
                                            {availability?.confirmed && availability?.hasProduct !== false && !["in_transit", "delivered", "completed", "unavailable", "returned"].includes(item.status) && (
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
                                            )}

                                            {item.status === "in_transit" && (
                                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200">
                                                    <CheckCircle className="h-4 w-4" />
                                                    <span className="text-sm font-medium">Item has been sent to customer</span>
                                                </div>
                                            )}
                                            
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