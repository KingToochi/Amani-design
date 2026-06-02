import { useLocation, Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./AuthProvider";

const ProtectedRoute = ({ allowedRole }) => {
    const { auth, loading } = useContext(AuthContext);
    const location = useLocation();

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (auth?.role && allowedRole.includes(auth.role)) {
        return <Outlet />;
    } 
    else if (auth?.id) {
        return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    } 
    else {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
};

export default ProtectedRoute;