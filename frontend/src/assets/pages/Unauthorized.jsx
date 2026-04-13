import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faHome, faSignInAlt } from "@fortawesome/free-solid-svg-icons";

const Unauthorized = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center px-4">
            <div className="text-center">
                <div className="mb-8">
                    <FontAwesomeIcon
                        icon={faLock}
                        className="text-8xl text-red-400 mb-4"
                    />
                    <h1 className="text-6xl font-bold text-gray-800 mb-4">403</h1>
                </div>
                <h2 className="text-3xl font-semibold text-gray-700 mb-4">
                    Access Denied
                </h2>
                <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                    You don't have permission to access this page. Please contact the administrator if you believe this is an error.
                </p>
                <div className="space-y-4">
                    <Link
                        to="/"
                        className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-lg hover:shadow-xl mr-4"
                    >
                        <FontAwesomeIcon icon={faHome} className="mr-2" />
                        Go to Homepage
                    </Link>
                    <Link
                        to="/login"
                        className="inline-flex items-center px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
                    >
                        <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;