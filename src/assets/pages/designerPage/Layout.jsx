import Header from "./Header";
import { Outlet } from "react-router-dom";
import SideBar from "./SideBar";
const Layout = () => {
    



return(
    <div
    className="w-full flex"
    >
        <SideBar 
        className="hidden md:flex"
        />
        <div
        className="flex flex-col w-full md:w-[80%]"
        >
            <Header />
            <Outlet />
        </div>
    </div>
)
}

export default Layout;