import Header from "./Header";
import { Outlet } from "react-router-dom";
import Navigation from "./Navigation";
const Layout = () => {
   
    return (
        <div
        className="w-full relative"
        >
            <Outlet />
            <Navigation />
        </div>
    )
}

export default Layout;