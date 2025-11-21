import Header from "./Header";
import { Outlet } from "react-router-dom";
import Navigation from "./Navigation";
import { useState } from "react";
const Layout = () => {
    const [cart, setCart] = useState([])
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