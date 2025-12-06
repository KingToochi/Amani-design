import { useEffect, useState} from "react";
import { MdOutlineDashboard  } from "react-icons/md"
import { FcSalesPerformance } from "react-icons/fc"
import { Link } from "react-router-dom";
import { IoChatboxOutline, IoSettingsOutline } from "react-icons/io5";
import { IoMenuOutline } from "react-icons/io5";
import { IoMdNotificationsOutline } from "react-icons/io";
import logo from "../../images/mainLogo.jpg"
import { FiSearch } from "react-icons/fi";
import { FaPalette } from "react-icons/fa6";
import { BsTag } from "react-icons/bs";
import { FaStore } from "react-icons/fa6";

const Header = () => {
    const [userData, setUserData] = useState([])
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
    const [showMenu, setShowMenu] = useState(false)
    const [showSearchBar, setShowSearchBar] = useState(false)
    const fetchUser = async () => {
        try {
            let response = await fetch("http://localhost:3000/users");
            const data = await response.json();
            setUserData(data)
        }catch(error){
            console.log(error)
        }
    }

    useEffect(() => {
        fetchUser()
        const handleResize = () =>setIsMobile(window.innerWidth < 768)
        window.addEventListener("resize", handleResize)

        return () => window.removeEventListener("resize", handleResize)
    },[])

    const onClickMenuBar = () => setShowMenu((prev) => !prev)
    const onClickSearchIcon  = () =>  setShowSearchBar((prev) => !prev)

    const onSubmit = (e) => {
        e.preventDefault();
    }

    

    return(
        <>
            {isMobile
            ?
            <div
            className="w-full  flex items-center gap-6 bg-stone-800 px-2 py-2"
            >
                <div
                className="w-[10%] flex justify-center"
                >
                    <IoMenuOutline 
                    className={`${showMenu ? "hidden" : "block"} text-lg text-gray-50 sm:text-2xl`}
                    onClick={onClickMenuBar}
                    />
                    {
                        showMenu &&
                        <div
                        className="min-w-screen min-h-screen z-50 bg-gray-50 fixed inset-0 flex flex-col items-center px-4 py-4 gap-6"
                        >
                            <button onClick={onClickMenuBar}
                            className="w-full flex justify-end"
                            >
                                <h1
                                className="text-2xl font-bold text-red-600"
                                >X</h1>
                            </button>
                            <div
                            className="w-full flex flex-col items-center"
                            >
                                <img src={logo} alt="amaniSky logo"
                                className="w-[50px] h-[50px] rounded-[50%]
                                sm:w-[100px] sm:h-[100px] rounded-[50%]"
                                />
                                <div
                                className="flex flex-col items-center"
                                >
                                    <h1
                                    className="font-[abril] font-normal text-base
                                    sm:text-xl
                                    "
                                    >Toochi Umoke</h1>
                                    <h1
                                    className="font-[abril] font-light text-gray-400 text-lg
                                    sm:text-xl
                                    "
                                    >Fashion Designer</h1>
                                </div>
                            </div>
                            <ul
                            className="w-full flex flex-col gap-6 px-6 px-2"
                            >
                                <li>
                                    <Link  onClick={menubar}
                                    className="flex gap-6 items-center text-lg font-semibold font-[abril] 
                                    focus:bg-purple-800/50 px-2 focus:rounded-lg
                                    sm:text-xl
                                    "
                                    >
                                        <MdOutlineDashboard />
                                        <h2>Dashboard</h2>
                                    </Link>
                                </li>
                                <li>
                                    <Link  onClick={menubar}
                                    className="flex gap-6 items-center text-lg font-semibold font-[abril]
                                    focus:bg-purple-800/50 px-2 focus:rounded-lg
                                    sm:text-xl
                                    "
                                    >
                                        <FcSalesPerformance/>
                                        <h2>Analytics</h2>
                                    </Link>
                                </li>

                                <li>
                                    <Link to="/"
                                    onClick={menubar}
                                    className="flex gap-6 items-center text-lg font-semibold font-[abril]
                                    focus:bg-purple-800/50 px-2 focus:rounded-lg
                                    sm:text-xl
                                    "
                                    >
                                        <FaStore />
                                        <h2>MarketPlace</h2>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="products" onClick={menubar}
                                    className="flex gap-6 items-center text-lg font-semibold font-[abril]
                                    focus:bg-purple-800/50 px-2 focus:rounded-lg
                                    sm:text-xl
                                    "
                                    >
                                        <FaPalette/>
                                        <h2>My Designs</h2>
                                    </Link>
                                </li>
                                <li>
                                    <Link  onClick={menubar}
                                    className="flex gap-6 items-center text-lg font-semibold font-[abril]
                                    focus:bg-purple-800/50 px-2 focus:rounded-lg
                                    sm:text-xl
                                    "
                                    >
                                        <BsTag/>
                                        <h2>Sales</h2>
                                    </Link>
                                </li>
                                <li>
                                    <Link  onClick={menubar}
                                    className="flex gap-6 items-center text-lg font-semibold font-[abril]
                                    focus:bg-purple-800/50 px-2 focus:rounded-lg
                                    sm:text-xl
                                    "
                                    >
                                        <IoChatboxOutline/>
                                        <h2>Message</h2>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="profile" onClick={menubar}
                                    className="flex gap-6 items-center text-lg font-semibold font-[abril]
                                    focus:bg-purple-800/50 px-2 focus:rounded-lg
                                    sm:text-xl
                                    "
                                    >
                                        <IoSettingsOutline/>
                                        <h2>Settings</h2>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    }
                </div>
                {userData.map(
                    user => (
                        <div key={user.id}
                        className="w-[80%] flex gap-2 items-center font-[abril]"
                        >
                            <h1
                            className="text-lg font-medium text-gray-50 
                            sm:text-xl
                            "
                            >
                                Welcome,
                            </h1>
                            <div
                            className="w-[65%] flex flex-col items-left"
                            >
                                <h1
                                className="text-lg font-semibold text-gray-50
                                sm:text-xl
                                "
                                >{user.userName}</h1>
                            </div>
                        </div>
                    )
                )}
                <div
                className="w-[25%] flex gap-6 justify-around items-center"
                >
                    <FiSearch 
                    className={`text-lg" ${showSearchBar? "hidden" : "flex"} text-gray-50 sm:text-2xl`}
                    onClick={onClickSearchIcon}
                    />
                    <IoMdNotificationsOutline
                    className="text-lg text-gray-50 sm:text-2xl"
                    />
                </div>
                {showSearchBar &&
                <form onSubmit={onSubmit}
                className="min-w-screen absolute right-0 left-0 top-0 flex flex-col px-2 py-2  bg-white gap-2"
                >
                    <h1
                    onClick={onClickSearchIcon}
                    className="flex justify-end text-2xl font-bold text-red-600"
                    >X</h1>
                    <input type="search" placeholder="search"
                    className="w-full h-[50px] border-2 border-gray-900 rounded-lg px-2 text-2xl font-medium font-[abril] focus:outline-none"
                    />
                </form>
                }
            </div>
            :
            <div
            className="w-full flex bg-stone-800 py-4 h-auto"
            >
                <div
                className="w-full flex"
                >
                    {userData.map(
                        user => (
                            <div key={user.id}
                            className="w-[65%] flex gap-2 px-2 py-2 items-center
                            lg:w-[80%] 
                            "
                            >
                                <h1
                                className="text-xl font-normal font-[abril] text-gray-50"
                                >Welcome,</h1>
                                <h1
                                className="text-xl font-bold font-[abril] text-gray-50"
                                >{user.userName}</h1>
                            </div>
                        )
                    )}
                    <div
                    className="w-[35%] flex items-center justify-around px-2
                    lg:w-[20%]
                    "
                    >
                        <form onSubmit={onSubmit}
                        className="w-[90%] flex items-center pl-2 bg-gray-400/50 rounded-lg"
                        >
                            <button
                            >
                                <FiSearch 
                                className="text-xl text-gray-300"
                                />
                            </button>
                            <input type="search" placeholder="search"
                            className="w-full h-[30px]  pl-2 text-2xl text-gray-100 font-medium font-[abril] focus:outline-none focus:text-gray-50"
                            />
                        </form>
                        <IoMdNotificationsOutline
                        className="text-xl text-gray-50"
                        />
                    </div>
                </div>
            </div>
            }
        </>
    )

}

export default Header;


