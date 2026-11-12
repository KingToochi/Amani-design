import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute";

const DesignerLayout = lazy(() => import("./pages/seller/Layout"));
const Product = lazy(() => import("./pages/seller/Products"));
const Profile = lazy(() => import("./pages/seller/Profile.jsx"));
const ProductDetails = lazy(() => import("./pages/seller/ProductDetails"));
const Layout = lazy(() => import("./pages/customer/MarketPlaceLayout"));
const Products = lazy(() => import("./pages/customer/Products"));
const PDetails = lazy(() => import("./pages/customer/PDetails"));
const Cart = lazy(() => import("./pages/customer/Cart"));
const WishList = lazy(() => import("./pages/customer/WishList"));
const ProfilePage = lazy(() => import("./pages/customer/ProfilePage"));
const Login = lazy(() => import("./pages/auth/Login"));
const UserRegistration = lazy(() => import("./pages/auth/UserRegistration"));
const DesignerRegistration = lazy(() => import("./pages/auth/DesignersRegistration"));
const Page404 = lazy(() => import("./pages/errors/404"));
const Unauthorized = lazy(() => import("./pages/errors/Unauthorized"));
const HomePage = lazy(() => import("./pages/customer/HomePage"));
const CheckOut = lazy(() => import("./pages/customer/CheckOutPage"));
const PaymentCallback = lazy(() => import("./features/payments/components/PaymentCallback"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminLogin = lazy(() => import("./pages/admin/AdmniLogin"));
const Dashboard = lazy(() => import("./pages/seller/Dashboard"));
const Orders = lazy(() => import("./pages/seller/Orders"));
const Sales = lazy(() => import("./pages/seller/Sales"));
const Message = lazy(() => import("./pages/seller/message"));
const Order = lazy(() => import("./pages/admin/Order"));
const Vendors = lazy(() => import("./pages/admin/Vendors"));
const ViewVendor = lazy(() => import("./pages/admin/ViewVendor"));
const ViewProduct = lazy(() => import("./pages/admin/ViewProduct"));
const ViewCustomer = lazy(() => import("./pages/admin/VIewCustomer"));
const Customer = lazy(() => import("./pages/admin/Customers"));
const ProductAdmin = lazy(() => import("./pages/admin/Product"));
const PayoutManagement = lazy(() => import("./pages/admin/PayoutManagement"));
const PayoutReview = lazy(() => import("./pages/admin/PayoutReview"));
const CustomerOrder = lazy(() => import("./pages/customer/Orders"));
const OrderDetails = lazy(() => import("./pages/customer/OrderDetails"));
const VendorOrderDetails = lazy(() => import("./pages/seller/OrderDetails"));
const CollectionPage = lazy(() => import("./pages/customer/CollectionPage"));
const AboutPage = lazy(() => import("./pages/customer/AboutPage"));
const ContactPage = lazy(() => import("./pages/customer/ContactPage"));
const FAQPage = lazy(() => import("./pages/customer/FAQPage"));
const PrivacyPage = lazy(() => import("./pages/customer/PrivacyPage"));
const TermsPage = lazy(() => import("./pages/customer/TermsPage"));
const FlutterwavePaymentData = lazy(() => import("./features/payments/components/FlutterWavePayment"));
const InitiatePayment = lazy(() => import("./features/payments/components/InitiatePayment"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword.jsx"));
const ForgetPassword = lazy(() => import("./pages/auth/ForgetPassword.jsx"));
const Subscription = lazy(() => import("./pages/seller/subscription/Subscription.jsx"));
const UpdateVerification = lazy(() => import("./pages/seller/updateVerification.jsx"));

function App() {
  return (
    <div className="w-full overflow-x-hidden min-h-screen bg-gray-50
    ">
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center" role="status">Loading page...</div>}>
        <Routes>
          <Route index element={<HomePage />} />
          <Route path="/vendor-registration" element={<DesignerRegistration />} />
          <Route path="/" element={<Layout />}>
          <Route path="login" element={<Login />} />
          <Route path="products" element={<Products />} />
          <Route path="product-details/:_id" element={<PDetails />} />
          <Route path="cart" element={<Cart/>} />
          <Route path="wishlist" element={<WishList />} />
          <Route path="profile" element={<ProfilePage/>} />
          <Route path="login/registration" element={<UserRegistration/>}/> 
          <Route path="checkout" element={<CheckOut/>} />
          <Route path="payment" element={<FlutterwavePaymentData/>} />
          <Route path="initiate-payment" element={<InitiatePayment/>} />
          <Route path="payment-callback" element={<PaymentCallback />} />
          <Route path="customer-orders" element={<CustomerOrder />} />
          <Route path="order-details/:id" element={<OrderDetails/>} />
          <Route path="collection/:slug" element={<CollectionPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="faq" element={<FAQPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="reset-password" element={<ResetPassword/>} /> 
          <Route path="forget-password" element={<ForgetPassword/>} />
          </Route>

          <Route path="/admin-login" element={<AdminLogin />} />

          <Route element={<ProtectedRoute allowedRole={["vendor", "designer", "admin"]}/>}>
          <Route path="/vendor" element={<DesignerLayout/>}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Product/>} />
          <Route path="profile" element={<Profile />} />
          <Route path="productdetails/:id" element={<ProductDetails />} />
          <Route path="orders" element={<Orders />} />
          <Route path="sales" element={<Sales />} />
          <Route path="messages" element={<Message />} />
          <Route path="orders/vendor_order/:id" element={<VendorOrderDetails/>}/>
          <Route path="subscription" element={<Subscription/>}/>
          <Route path="update-verification/:id" element={<UpdateVerification />} />
          </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRole={["admin"]}/>}>
            <Route path="/admin" element={<AdminLayout />} >
            <Route index element={<AdminDashboard />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="viewVendor/:id" element={<ViewVendor />} />
            <Route path="viewProduct/:id" element={<ViewProduct />} />
            <Route path="viewCustomer/:id" element={<ViewCustomer />} />
            <Route path="orders" element={<Order />} />
            <Route path="payouts" element={<PayoutManagement />} />
            <Route path="payouts/review/:vendorId/:orderId/:itemId" element={<PayoutReview />} />
            <Route path="customers" element={<Customer />} />
            <Route path="products" element={<ProductAdmin />} />
            </Route>
          </Route>
        

           <Route path="Unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<Page404 />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
