import { FaHome } from "react-icons/fa";
import { FcSalesPerformance } from "react-icons/fc"
import { AiFillProduct } from "react-icons/ai";
import { Link } from "react-router-dom";
import { IoChatboxOutline } from "react-icons/io5";
import { FaRegUserCircle } from "react-icons/fa";
import { FaStoreAlt } from "react-icons/fa";
import { IoMdNotificationsOutline } from "react-icons/io";
import logo from "../../images/mainLogo.jpg"
import { FiSearch } from "react-icons/fi";


const SideBar = ({className}) => {


    return(
        <div
        className={`flex flex-col w-[20%] bg-gray-50 gap-6 min-h-screen px-2 py-4 border-r-1 border-gray-700 ${className}`}
        >
            <div
            className="w-full flex items-center justify-center"
            >
                <img src={logo} alt="AmaniSky Logo"
                className="w-[80px] h-[80px] rounded-[50%]"
                />
            </div>
            <ul 
            className="flex flex-col gap-6"
            >
                <li>
                    <Link
                    className="flex w-full items-center gap-2 text-2xl font-[abril] font-normal"
                    >
                        <FaHome />
                        <h1>Dashboard</h1>
                    </Link>
                </li>
                <li>
                    <Link
                    className="flex w-full items-center gap-2 text-2xl font-[abril] font-normal"
                    >
                        <FcSalesPerformance />
                        <h1>Analytics</h1>
                    </Link>
                </li>
                <li>
                    <Link to="products"
                    className="flex w-full items-center gap-2 text-2xl font-[abril] font-normal"
                    >
                        <AiFillProduct />
                        <h1>Products</h1>
                    </Link>
                </li>
                <li>
                    <Link
                    className="flex w-full items-center gap-2 text-2xl font-[abril] font-normal"
                    >
                        <FaStoreAlt />
                        <h1>Store</h1>
                    </Link>
                </li>
                <li>
                    <Link
                    className="flex w-full items-center gap-2 text-2xl font-[abril] font-normal"
                    >
                        <IoChatboxOutline />
                        <h1>Message</h1>
                    </Link>
                </li>
                <li>
                    <Link to="profile"
                    className="flex w-full items-center gap-2 text-2xl font-[abril] font-normal"
                    >
                        <FaRegUserCircle />
                        <h1>Profile</h1>
                    </Link>
                </li>
            </ul>
        </div>
    )
}

export default SideBar;