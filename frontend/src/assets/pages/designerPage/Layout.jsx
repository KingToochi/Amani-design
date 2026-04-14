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
        className="flex flex-col w-full md:w-[75%] lg:w-[82%] xl:w-[85%]"
        >
            <Header />
            <Outlet />
        </div>
    </div>
)
}

export default Layout;