import { Routes, Route } from "react-router-dom";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import LandingPage from "./assets/pages/LandingPage";
import DesignerLayout from "./assets/pages/designerPage/Layout";
import Products from "./assets/pages/designerPage/Products";
import Profile from "./assets/pages/designerPage/Profile";
import ProductDetails from "./assets/pages/designerPage/ProductDetails";
import Layout from "./assets/pages/marketPlace/MarketPlaceLayout";
import HomePage from "./assets/pages/marketPlace/HomePage";
import PDetails from "./assets/pages/marketPlace/PDetails";
import Cart from "./assets/pages/marketPlace/Cart";
import WishList from "./assets/pages/marketPlace/WishList";
import ProfilePage from "./assets/pages/marketPlace/ProfilePage";
import Login from "./assets/pages/Login";
import UserRegistration from "./assets/pages/UserRegistration"
import ProtectedRoute from "./assets/pages/marketPlace/hooks/ProtectedRoute";
import Page404 from "./assets/pages/404";
import Unauthorized from "./assets/pages/Unauthorized"

function App() {
  return (
    <div className="w-full overflow-x-hidden min-h-screen bg-gray-50
    ">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="login" element={<Login />} />
          <Route index element={<HomePage />} />
          <Route path="product-details/:id" element={<PDetails />} />
          <Route path="cart" element={<Cart/>} />
          <Route path="wishlist" element={<WishList />} />
          <Route path="profile" element={<ProfilePage/>} />
          <Route path="login/registration" element={<UserRegistration/>}/>
        </Route>
        <Route element={<ProtectedRoute allowedStatus={"designer"}/>}>
        <Route path="/designer" element={<DesignerLayout/>}>
          <Route path="products" element={<Products/>} />
          <Route path="profile" element={<Profile />} />
          <Route path="productdetails/:id" element={<ProductDetails />} />
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
