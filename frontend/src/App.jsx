import { Routes, Route } from "react-router-dom";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import DesignerLayout from "./pages/seller/Layout";
import Product from "./pages/seller/Products";
// import Profile from "./pages/seller/Profile";
import ProductDetails from "./pages/seller/ProductDetails";
import Layout from "./pages/customer/MarketPlaceLayout";
import Products from "./pages/customer/Products";
import PDetails from "./pages/customer/PDetails";
import Cart from "./pages/customer/Cart";
import WishList from "./pages/customer/WishList";
import ProfilePage from "./pages/customer/ProfilePage";
import Login from "./pages/auth/Login";
import UserRegistration from "./pages/auth/UserRegistration"
import ProtectedRoute from "./routes/ProtectedRoute";
import Page404 from "./pages/errors/404";
import Unauthorized from "./pages/errors/Unauthorized"
import HomePage from "./pages/customer/HomePage";
import CheckOut from "./pages/customer/CheckOutPage";
import PaymentCallback from "./features/payments/components/PaymentCallback";
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminLayout from "./pages/admin/AdminLayout";
import AdminLogin from "./pages/admin/AdmniLogin";
import Dashboard from "./pages/seller/Dashboard";
import Orders from "./pages/seller/Orders";
import Sales from "./pages/seller/Sales";
import Order from "./pages/admin/Order";
import Vendors from "./pages/admin/Vendors";
import ViewVendor from "./pages/admin/ViewVendor";
import ViewProduct from "./pages/admin/ViewProduct";
import ViewCustomer from "./pages/admin/VIewCustomer";
import Customer from "./pages/admin/Customers";
import ProductAdmin from "./pages/admin/Product";
import CustomerOrder from "./pages/customer/Orders";
import OrderDetails from "./pages/customer/OrderDetails";
import VendorOrderDetails from "./pages/seller/OrderDetails";
import CollectionPage from "./pages/customer/CollectionPage";
import AboutPage from "./pages/customer/AboutPage";
import ContactPage from "./pages/customer/ContactPage";
import FAQPage from "./pages/customer/FAQPage";
import PrivacyPage from "./pages/customer/PrivacyPage";
import TermsPage from "./pages/customer/TermsPage";
import FlutterwavePaymentData from "./features/payments/components/FlutterWavePayment";
import InitiatePayment from "./features/payments/components/InitiatePayment";

function App() {
  return (
    <div className="w-full overflow-x-hidden min-h-screen bg-gray-50
    ">
      <Routes>
        <Route index element={<HomePage />} />    
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
          <Route path="admin-login" element={<AdminLogin />} />
          <Route path="order-details/:id" element={<OrderDetails/>} />
          <Route path="collection/:slug" element={<CollectionPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="faq" element={<FAQPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="terms" element={<TermsPage />} />
        </Route>
        <Route element={<ProtectedRoute allowedRole={["vendor", "designer", "admin"]}/>}>
        <Route path="/vendor" element={<DesignerLayout/>}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Product/>} />
          {/* <Route path="profile" element={<Profile />} /> */}
          <Route path="productdetails/:id" element={<ProductDetails />} />
          <Route path="orders" element={<Orders />} />
          <Route path="sales" element={<Sales />} />
          <Route path="orders/vendor_order/:id" element={<VendorOrderDetails/>}/>
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
            <Route path="customers" element={<Customer />} />
            <Route path="products" element={<ProductAdmin />} />
          </Route>
        </Route>
        

         <Route path="Unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<Page404 />} />
      </Routes>
    </div>
  );
}

export default App;
library.add(fab, fas, far);
