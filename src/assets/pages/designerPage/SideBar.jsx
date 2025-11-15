import { MdOutlineDashboard  } from "react-icons/md";
import { FcSalesPerformance } from "react-icons/fc"
import { FaPalette } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { IoChatboxOutline } from "react-icons/io5";
import { IoSettingsOutline } from "react-icons/io5";
import { BsTag } from "react-icons/bs";
import logo from "../../images/mainLogo.jpg"



const SideBar = ({className}) => {


    return(
        <div
        className={`flex flex-col w-[25%]  bg-stone-900 text-gray-50 gap-6 min-h-screen px-4 py-4 border-r-1 border-gray-700  ${className} 
        lg:w-[18%] xl:w-[15%]
        `}
        >
            <div
            className="w-full flex items-center gap-2"
            >
                <img src={logo} alt="AmaniSky Logo"
                className="w-[40px] h-[40px] rounded-[50%]"
                />
                <div
                className="flex flex-col justify-center"
                >
                    <h1
                    className="font-[abril] font-normal text-base"
                    >Toochi Umoke</h1>
                    <h1
                    className="font-[abril] font-light text-gray-400 text-lg"
                    >Fashion Designer</h1>
                </div>
            </div>
            <ul 
            className="flex flex-col gap-6 "
            >
                <li>
                    <Link
                    className="flex w-full items-center gap-2 text-lg font-[abril] font-normal focus:bg-purple-800/50 px-2 focus:rounded-lg"
                    >
                        <MdOutlineDashboard  />
                        <h1>Dashboard</h1>
                    </Link>
                </li>
                <li>
                    <Link
                    className="flex w-full items-center gap-2 text-lg font-[abril] font-normal focus:bg-purple-800/50 px-2 focus:rounded-lg"
                    >
                        <FcSalesPerformance />
                        <h1>Analytics</h1>
                    </Link>
                </li>
                <li>
                    <Link to="products"
                    className="flex w-full items-center gap-2 text-lg font-[abril] font-normal focus:bg-purple-800/50 px-2 focus:rounded-lg"
                    >
                        <FaPalette />
                        <h1>My Designs</h1>
                    </Link>
                </li>
                <li>
                    <Link
                    className="flex w-full items-center gap-2 text-lg font-[abril] font-normal  focus:bg-purple-800/50 px-2 focus:rounded-lg"
                    >
                        <BsTag />
                        <h1>Sales</h1>
                    </Link>
                </li>
                <li>
                    <Link
                    className="flex w-full items-center gap-2 text-lg font-[abril] font-normal focus:bg-purple-800/50 px-2 focus:rounded-lg"
                    >
                        <IoChatboxOutline />
                        <h1>Message</h1>
                    </Link>
                </li>
                <li>
                    <Link to="profile"
                    className="flex w-full items-center gap-2 text-lg font-[abril] font-normal focus:bg-purple-800/50 px-2 focus:rounded-lg"
                    >
                        <IoSettingsOutline />
                        <h1>Settings</h1>
                    </Link>
                </li>
            </ul>
        </div>
    )
}

export default SideBar;