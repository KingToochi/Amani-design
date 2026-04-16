import { useState } from "react";
import { Link, useLocation, useNavigate} from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Logo from "../../images/mainLogo.jpg";
import {BASE_URL} from "../../Url";
import { useEffect, useContext } from "react";
import { AuthContext } from "../marketPlace/hooks/AuthProvider";
import {
    faTachometerAlt,
    faUserTie,
    faUsers,
    faBox,
    faShoppingCart,
    faMoneyBillWave,
    faCreditCard,
    faExclamationTriangle,
    faUndo,
    faBullhorn,
    faChartBar,
    faCog,
    faBars,
    faTimes
} from "@fortawesome/free-solid-svg-icons";

const NavBar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [adminDetails, setAdminDetails] = useState({});
    const location = useLocation();
    const { auth } = useContext(AuthContext);
    const url = BASE_URL;
    const token = localStorage.getItem("token");
    const navigate = useNavigate();


    const fetchAdminDetails = async () => {
        if (!token) {
            navigate("/admin-login");
            return;
        }

        if (auth.role !== "admin") {
            navigate("/admin-login");   
            return;
        }

        try {
            const response = await fetch(`${url}/admin/details`, {
                method: "GET",
                headers: {
                    authorization: `Bearer ${token}`
                }
            });
            const data = await response.json();
            setAdminDetails(data.admin);
        }catch(err){
            console.error("Error fetching admin details:", err);
        }
    }

    const navItems = [
        { name: "Dashboard", path: "/admin/dashboard", icon: faTachometerAlt },
        { name: "Designers", path: "/admin/designers", icon: faUserTie },
        { name: "Customers", path: "/admin/customers", icon: faUsers },
        { name: "Products", path: "/admin/products", icon: faBox },
        { name: "Orders", path: "/admin/orders", icon: faShoppingCart },
        { name: "Commission", path: "/admin/commission", icon: faMoneyBillWave },
        { name: "Payout Management", path: "/admin/payouts", icon: faCreditCard },
        { name: "Dispute Center", path: "/admin/disputes", icon: faExclamationTriangle },
        { name: "Refund Management", path: "/admin/refunds", icon: faUndo },
        { name: "Marketing", path: "/admin/marketing", icon: faBullhorn },
        { name: "Analytics & Report", path: "/admin/analytics", icon: faChartBar },
        { name: "Settings", path: "/admin/settings", icon: faCog },
    ];

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const closeMenu = () => {
        setIsOpen(false);
    };

    const getAge = (dob) => {
        if (!dob) return null;
        const birthDate = new Date(dob);
        if (Number.isNaN(birthDate.getTime())) return null;
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age -= 1;
        }
        return age;
    };

    useEffect(() => {
        fetchAdminDetails();
    }, [auth]);    

    return (
        <nav className="bg-white shadow-lg border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2">
                <div className="flex justify-between h-16">
                    {/* Logo/Title */}
                    <div className="flex items-center">
                        <Link to="/admin/dashboard" className="flex items-center">
                            <img src={Logo} alt="Logo" className="h-10 w-10 mr-2 rounded-[50%]" />
                            <span className="font-bold text-xl text-gray-800">Admin Panel</span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex items-center px-2 py-1 rounded-md text-xs font-medium transition-colors duration-200 ${
                                    location.pathname === item.path
                                        ? "bg-indigo-100 text-indigo-700"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                }`}
                            >
                                <FontAwesomeIcon icon={item.icon} className="mr-1" />
                                {item.name}
                            </Link>
                        ))}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={toggleMenu}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                        >
                            <FontAwesomeIcon icon={isOpen ? faTimes : faBars} className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Admin Details */}
            <div className="bg-gray-50 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-2 py-4">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
                        <div className="flex items-center gap-4">
                            <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                                {adminDetails?.profilePicture ? (
                                    <img
                                        src={adminDetails.profilePicture}
                                        alt={`${adminDetails.fname || "Admin"} ${adminDetails.lname || ""}`}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span className="text-gray-500 text-sm">No Image</span>
                                )}
                            </div>
                            <div>
                                <p className="text-lg font-semibold text-gray-900">
                                    {`${adminDetails?.fname || ""} ${adminDetails?.lname || ""}`.trim() || "Admin User"}
                                </p>
                                <p className="text-sm text-gray-600">Admin profile details</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-auto">
                            <div className="rounded-lg bg-white p-3 shadow-sm border border-gray-200">
                                <p className="text-xs uppercase tracking-wide text-gray-500">Age</p>
                                <p className="mt-1 text-sm text-gray-900">
                                    {adminDetails?.dob ? `${getAge(adminDetails.dob)} years` : "Not set"}
                                </p>
                            </div>
                            <div className="rounded-lg bg-white p-3 shadow-sm border border-gray-200">
                                <p className="text-xs uppercase tracking-wide text-gray-500">Phone Number</p>
                                <p className="mt-1 text-sm text-gray-900">{adminDetails?.phoneNumber || "Not set"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 border-t border-gray-200">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                onClick={closeMenu}
                                className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                                    location.pathname === item.path
                                        ? "bg-indigo-100 text-indigo-700"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                }`}
                            >
                                <FontAwesomeIcon icon={item.icon} className="mr-3" />
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default NavBar;