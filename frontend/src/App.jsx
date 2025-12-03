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

function App() {
  return (
    <div className="w-full overflow-x-hidden min-h-screen bg-gray-50
    ">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="registration" element={<LandingPage />} />
          <Route index element={<HomePage />} />
          <Route path="product-details/:id" element={<PDetails />} />
          <Route path="cart" element={<Cart/>} />
          <Route path="wishlist" element={<WishList />} />
          <Route path="profile" element={<ProfilePage/>} />
        </Route>
        <Route path="/" element={<DesignerLayout/>}>
          <Route path="products" element={<Products/>} />
          <Route path="profile" element={<Profile />} />
          <Route path="productdetails/:id" element={<ProductDetails />} />
        </Route> 
      
      </Routes>
    </div>
  );
}

export default App;
library.add(fab, fas, far);
