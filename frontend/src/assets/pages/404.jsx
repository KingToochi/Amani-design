import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faSearch } from "@fortawesome/free-solid-svg-icons";

const Page404 = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
            <div className="text-center">
                <div className="mb-8">
                    <FontAwesomeIcon
                        icon={faSearch}
                        className="text-8xl text-indigo-400 mb-4"
                    />
                    <h1 className="text-9xl font-bold text-gray-800 mb-4">404</h1>
                </div>
                <h2 className="text-3xl font-semibold text-gray-700 mb-4">
                    Oops! Page Not Found
                </h2>
                <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                    The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
                </p>
                <div className="space-y-4">
                    <Link
                        to="/"
                        className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
                    >
                        <FontAwesomeIcon icon={faHome} className="mr-2" />
                        Go to Homepage
                    </Link>
                    <div>
                        <Link
                            to="/login"
                            className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200"
                        >
                            Or go to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Page404;