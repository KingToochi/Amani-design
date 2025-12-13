import { useLocation, Navigate, Outlet} from "react-router-dom";
import { useContext } from "react";
import { Authcontext } from "./AuthProvider";

const ProtectedRoute = ({allowedStatus}) => {
    const {auth} = useContext(Authcontext)
    const location = useLocation()

    if (auth?.status?.includes(allowedStatus)) {
        return <Outlet />
    } else if (auth?.id) {
        return <Navigate to="/" state={{from: location}} replace />
    } else {
        return <Navigate to="/unauthorized" state={{from:location}} replace />
    }
}

export default ProtectedRoute;