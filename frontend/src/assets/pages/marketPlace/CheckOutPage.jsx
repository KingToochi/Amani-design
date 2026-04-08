import { useState, useContext, useEffect } from 'react';
import { BASE_URL } from '../../Url';
import { AuthContext } from './hooks/AuthProvider';
import { CartContext } from './hooks/CartContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFlutterwave } from 'flutterwave-react-v3';
import { 
  ShoppingBag, 
  Truck, 
  CreditCard, 
  Shield, 
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Edit,
  CheckCircle,
  Package,
  AlertCircle,
  Loader
} from 'lucide-react';
import logo from "../../images/mainLogo.jpg"

const CheckOut = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [checkoutStep, setCheckoutStep] = useState(1);
    const [editMode, setEditMode] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [cartLoading, setCartLoading] = useState(true);
    const navigate = useNavigate();

    
    // ✅ Fix: Use array destructuring since context provides [cart, setCart]
    const [cart, setCart] = useContext(CartContext);
    
    // Safely get auth context
    const authContext = useContext(AuthContext);
    const user = authContext?.user;
    
    const url = BASE_URL;
    const token = localStorage.getItem("token");

    useEffect(() => {
        setCartLoading(false);
        fetchUserinfo();
    }, []);

    const fetchUserinfo = async () => {
        if (!token) {
            setError('Please log in to continue checkout');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${url}/userInfo`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setUserInfo(data.user);
        } catch (error) {
            console.error('Error fetching user info:', error);
            setError('Failed to load user information');
        } finally {
            setLoading(false);
        }
    };

    // Safe calculation functions
    const calculateSubtotal = () => {
        if (!cart || cart.length === 0) return 0;
        return cart.reduce((sum, item) => {
            const price = item?.price || 0;
            const quantity = item?.quantity || 1;
            return sum + (price * quantity);
        }, 0);
    };

    const calculateShipping = () => {
        // const subtotal = calculateSubtotal();
        return 8000 > 10000 ? 0 : 9.99;
    };

    const calculateTax = () => {
        return calculateSubtotal() * 0.08;
    };

    const calculateTotal = () => { 
        const total = calculateSubtotal() + calculateShipping() + calculateTax()
        return total
       
    };

    const handlePlaceOrder = () => {

        handleFlutterPayment({
            callback: (response) => {
               console.log(response);
                closePaymentModal() // this will close the modal programmatically
            },
            onClose: () => {},
          });
    };

    const config = {
    public_key: "FLWPUBK_TEST-83a22d70d3bcbefaddd2aafcb8e66f8b-X",
    tx_ref: Date.now(),
    amount: calculateTotal(),
    currency: 'NGN',
    payment_options: 'card,mobilemoney,ussd',
    customer: {
        email: userInfo?.email || '',
      phone_number: userInfo?.phoneNumber || '',
      name: `${userInfo?.fname || ''} ${userInfo?.lname || ''}`.trim()
    },
    customizations: {
          title: "Amanisky Fashion World",
          description: `Payment for ${cart?.length || 0} items`,
          logo: logo,
        },
  };

  const handleFlutterPayment = useFlutterwave(config);

    // Show loading state
    if (cartLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="h-12 w-12 animate-spin text-black mx-auto" />
                    <p className="mt-4 text-gray-600 font-light">Preparing your checkout...</p>
                </div>
            </div>
        );
    }

    // Show empty cart message
    if (!cart || cart.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
                    <ShoppingBag size={48} className="mx-auto mb-4 text-gray-400" />
                    <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
                    <p className="text-gray-600 mb-6">Add some items to your cart before checking out.</p>
                    <button 
                        onClick={() => window.location.href = '/products'}
                        className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition font-medium"
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
                    <div className="text-center">
                        <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
                        <h2 className="text-xl font-semibold mb-2">Checkout Unavailable</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <button 
                            onClick={() => window.location.href = '/login'}
                            className="w-full bg-black text-white py-3 rounded-full hover:bg-gray-800 transition font-medium"
                        >
                            Sign In to Continue
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (orderPlaced) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center"
                >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} className="text-green-600" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-2">Order Confirmed!</h2>
                    <p className="text-gray-600 mb-6">Thank you for your purchase. We'll send you shipping updates via email.</p>
                    <button 
                        onClick={() => window.location.href = '/orders'}
                        className="bg-black text-white px-8 py-3 rounded-full hover:bg-gray-800 transition font-medium"
                    >
                        Track Your Order
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 mb-[75px]">
            {/* Header with Progress */}
            <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <ShoppingBag className="h-6 w-6" />
                            <h1 className="font-semibold text-lg text-center flex flex-col tracking-tight">AmaniSky <span>Fashion World</span></h1>
                        </div>
                        <div className="hidden md:flex items-center space-x-8">
                            {['Cart', 'Shipping', 'Payment'].map((step, index) => (
                                <div key={step} className="flex items-center">
                                    <div className={`flex items-center ${checkoutStep > index + 1 ? 'text-green-600' : checkoutStep === index + 1 ? 'text-black' : 'text-gray-300'}`}>
                                        <div className={`
                                            w-8 h-8 rounded-full flex items-center justify-center border-2 
                                            ${checkoutStep > index + 1 
                                                ? 'border-green-600 bg-green-600 text-white' 
                                                : checkoutStep === index + 1
                                                    ? 'border-black bg-black text-white'
                                                    : 'border-gray-300 text-gray-300'
                                            }
                                        `}>
                                            {checkoutStep > index + 1 ? <CheckCircle size={16} /> : index + 1}
                                        </div>
                                        <span className="mx-2 text-sm font-medium">{step}</span>
                                    </div>
                                    {index < 2 && (
                                        <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Forms */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Shipping Information Card */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-sm p-6"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold flex items-center">
                                    <Truck className="h-5 w-5 mr-2" />
                                    Shipping Information
                                </h2>
                                <button 
                                    onClick={() => setEditMode(!editMode)}
                                    className="text-sm text-gray-500 hover:text-black flex items-center transition"
                                >
                                    <Edit className="h-4 w-4 mr-1" />
                                    {editMode ? 'Cancel' : 'Edit'}
                                </button>
                            </div>

                            {userInfo && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                            <p className="text-gray-900 font-medium">{userInfo.fname}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                            <p className="text-gray-900 font-medium">{userInfo.lname}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                            <Mail className="h-4 w-4 mr-1" /> Email
                                        </label>
                                        <p className="text-gray-900">{userInfo.email}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                            <Phone className="h-4 w-4 mr-1" /> Phone Number
                                        </label>
                                        {editMode ? (
                                            <input 
                                                type="tel" 
                                                defaultValue={userInfo.phoneNumber}
                                                className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
                                            />
                                        ) : (
                                            <p className="text-gray-900">{userInfo.phoneNumber}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                            <MapPin className="h-4 w-4 mr-1" /> Shipping Address
                                        </label>
                                        {editMode ? (
                                            <div className="space-y-3">
                                                <input 
                                                    type="text" 
                                                    defaultValue={userInfo.shippingAddress}
                                                    placeholder="Street address"
                                                    className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
                                                />
                                                <div className="grid grid-cols-2 gap-3">
                                                    <input 
                                                        type="text" 
                                                        defaultValue={userInfo.city}
                                                        placeholder="City"
                                                        className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
                                                    />
                                                    <input 
                                                        type="text" 
                                                        defaultValue={userInfo.state}
                                                        placeholder="State"
                                                        className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <p className="text-gray-900">
                                                {userInfo.shippingAddress}, {userInfo.city}, {userInfo.state}
                                            </p>
                                        )}
                                    </div>

                                    {editMode && (
                                        <button className="bg-black text-white px-6 py-2 rounded-xl hover:bg-gray-800 transition text-sm font-medium">
                                            Save Changes
                                        </button>
                                    )}
                                </div>
                            )}
                        </motion.div>

                        {/* Mobile Place Order Button */}
                        <button 
                            onClick={handlePlaceOrder}
                            className="lg:hidden w-full bg-black text-white py-4 rounded-xl hover:bg-gray-800 transition font-semibold shadow-lg"
                        >
                            Pay Now • ${calculateTotal().toFixed(2)}
                        </button>
                    </div>

                    {/* Right Column - Order Summary */}
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-1"
                    >
                        <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
                            <h2 className="text-lg font-semibold mb-6">Order Summary</h2>
                            
                            {/* Cart Items - Now using 'cart' directly */}
                            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
                                {cart.map((item, index) => (
                                    <motion.div 
                                        key={item._id || item.id || index}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex space-x-4"
                                    >
                                        <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                                            {item?.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                                            ) : (
                                                <Package className="h-6 w-6 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-sm">{item?.name || 'Product'}</h3>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Size: {item?.size || 'M'} | Qty: {item?.quantity || 1}
                                            </p>
                                            <p className="font-semibold text-sm mt-1">
                                                ${((item?.price || 0) * (item?.quantity || 1)).toFixed(2)}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Price Breakdown */}
                            <div className="space-y-3 py-4 border-t border-gray-100">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Shipping</span>
                                    {calculateShipping() === 0 ? (
                                        <span className="text-green-600 font-medium">Free</span>
                                    ) : (
                                        <span className="font-medium">${calculateShipping().toFixed(2)}</span>
                                    )}
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Tax (8%)</span>
                                    <span className="font-medium">${calculateTax().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-semibold pt-3 border-t border-gray-200">
                                    <span>Total</span>
                                    <span className="text-black">${calculateTotal().toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Free Shipping Progress */}
                            {calculateSubtotal() < 100 && (
                                <div className="mb-6">
                                    <div className="flex justify-between text-xs mb-2">
                                        <span className="text-gray-600">Add ${(100 - calculateSubtotal()).toFixed(2)} for free shipping</span>
                                        <span className="font-medium">{Math.round((calculateSubtotal() / 100) * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(calculateSubtotal() / 100) * 100}%` }}
                                            className="bg-black h-2 rounded-full"
                                        ></motion.div>
                                    </div>
                                </div>
                            )}

                            {/* Desktop Place Order Button */}
                            <button 
                                onClick={handlePlaceOrder}
                                className="hidden lg:block w-full bg-black text-white py-4 rounded-xl hover:bg-gray-800 transition font-semibold"
                            >
                                Pay Now • ${calculateTotal().toFixed(2)}
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>

        </div>
    );
};

export default CheckOut;