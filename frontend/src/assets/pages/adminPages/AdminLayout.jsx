import { Outlet } from "react-router-dom"
import NavBar from "./NavBar";

const AdminLayout = () => {

    return(
        <div>
            <NavBar />
            <Outlet />
        </div>
    )

}

export default AdminLayout;