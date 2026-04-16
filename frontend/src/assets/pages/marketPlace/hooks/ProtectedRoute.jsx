import { useLocation, Navigate, Outlet} from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./AuthProvider";

const ProtectedRoute = ({allowedRole}) => {
    const {auth} = useContext(AuthContext)
    const location = useLocation()

    if (auth?.role?.includes(allowedRole)) {
        return <Outlet />
    } else if (auth?.id) {
        return <Navigate to="/" state={{from: location}} replace />
    } else {
        return <Navigate to="/unauthorized" state={{from:location}} replace />
    }
}

export default ProtectedRoute;