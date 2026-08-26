import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

const LogoutButton = () => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        await logout();
        navigate("/login", { replace: true });
    };

    return (
        <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
            <LogOut size={16} aria-hidden="true" />
            {isLoggingOut ? "Logging out..." : "Log out"}
        </button>
    );
};

export default LogoutButton;