import { Routes, Route } from "react-router-dom";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import LandingPage from "./assets/pages/LandingPage";
import HomePage from "./assets/pages/designerPage/HomePage";
import DesignerLayout from "./assets/pages/designerPage/Layout";
import Products from "./assets/pages/designerPage/Products";
import Profile from "./assets/pages/designerPage/Profile";

function App() {
  return (
    <div className="w-full overflow-x-hidden min-h-screen bg-gray-950 ">
      <Routes>
        {/* <Route path="/" element={<LandingPage />} /> */}
        <Route path="/" element={<DesignerLayout/>}>
          <Route path="products" element={<Products/>} />
          <Route path="profile" element={<Profile />} />
        </Route>
      
      </Routes>
    </div>
  );
}

export default App;
library.add(fab, fas, far);
