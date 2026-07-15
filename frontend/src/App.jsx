import { Routes, Route } from "react-router-dom";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import LandingPage from "./assets/pages/LandingPage";
import DesignerLayout from "./assets/pages/designerPage/Layout";
import Product from "./assets/pages/designerPage/Products";
import Profile from "./assets/pages/designerPage/Profile";
import ProductDetails from "./assets/pages/designerPage/ProductDetails";
import Layout from "./assets/pages/marketPlace/MarketPlaceLayout";
import Products from "./assets/pages/marketPlace/Products";
import PDetails from "./assets/pages/marketPlace/PDetails";
import Cart from "./assets/pages/marketPlace/Cart";
import WishList from "./assets/pages/marketPlace/WishList";
import ProfilePage from "./assets/pages/marketPlace/ProfilePage";
import Login from "./assets/pages/Login";
import UserRegistration from "./assets/pages/UserRegistration"
import ProtectedRoute from "./assets/hooks/ProtectedRoute";
import Page404 from "./assets/pages/404";
import Unauthorized from "./assets/pages/Unauthorized"
import HomePage from "./assets/pages/public/HomePage";
import CheckOut from "./assets/pages/marketPlace/CheckOutPage";
import PaymentCallback from "./assets/components/PaymentCallback";
import AdminDashboard from "./assets/pages/adminPages/AdminDashboard"
import AdminLayout from "./assets/pages/adminPages/AdminLayout";
import AdminLogin from "./assets/pages/adminPages/AdmniLogin";
import Dashboard from "./assets/pages/designerPage/Dashboard";
import Orders from "./assets/pages/designerPage/Orders";
import Sales from "./assets/pages/designerPage/Sales";
import Order from "./assets/pages/adminPages/Order";
import Vendors from "./assets/pages/adminPages/Vendors";
import ViewVendor from "./assets/pages/adminPages/ViewVendor";
import ViewProduct from "./assets/pages/adminPages/ViewProduct";
import ViewCustomer from "./assets/pages/adminPages/VIewCustomer";
import Customer from "./assets/pages/adminPages/Customers";
import ProductAdmin from "./assets/pages/adminPages/Product";
import CustomerOrder from "./assets/pages/marketPlace/Orders";
import OrderDetails from "./assets/pages/marketPlace/OrderDetails";
import VendorOrderDetails from "./assets/pages/designerPage/OrderDetails";
import CollectionPage from "./assets/pages/marketPlace/CollectionPage";
import AboutPage from "./assets/pages/marketPlace/AboutPage";
import ContactPage from "./assets/pages/marketPlace/ContactPage";
import FAQPage from "./assets/pages/marketPlace/FAQPage";
import PrivacyPage from "./assets/pages/marketPlace/PrivacyPage";
import TermsPage from "./assets/pages/marketPlace/TermsPage";
import flutterwavePaymentData from "./assets/components/FlutterWavePayment";

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
          <Route path="payment" element={<flutterwavePaymentData/>} />
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
        <Route path="/designer" element={<DesignerLayout/>}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Product/>} />
          <Route path="profile" element={<Profile />} />
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
