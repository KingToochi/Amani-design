import { useEffect, useState} from "react";
import { FaHome } from "react-icons/fa";
import { FcSalesPerformance } from "react-icons/fc"
import { AiFillProduct } from "react-icons/ai";
import { Link } from "react-router-dom";
import { IoChatboxOutline } from "react-icons/io5";
import { FaRegUserCircle } from "react-icons/fa";
import { FaStoreAlt } from "react-icons/fa";
import { IoMenuOutline } from "react-icons/io5";
import { IoMdNotificationsOutline } from "react-icons/io";
import logo from "../../images/mainLogo.jpg"
import { FiSearch } from "react-icons/fi";
import SideBar from "./SideBar";


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
            className="w-full  flex items-center gap-6 bg-white px-2 py-2"
            >
                <div
                className="w-[10%] flex justify-center"
                >
                    <IoMenuOutline 
                    className={`${showMenu ? "hidden" : "block"} text-2xl sm:text-4xl`}
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
                            </div>
                            <ul
                            className="w-full flex flex-col gap-6 px-6 px-2"
                            >
                                <li>
                                    <Link
                                    className="flex gap-6 items-center text-2xl font-semibold font-[abril]
                                    sm:text-3xl"
                                    >
                                        <FaHome/>
                                        <h2>Dashboard</h2>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                    className="flex gap-6 items-center text-2xl font-semibold font-[abril]
                                    sm:text-3xl"
                                    >
                                        <FcSalesPerformance/>
                                        <h2>Analytics</h2>
                                    </Link>
                                </li>
                                <li>
                                    <Link to="products"
                                    className="flex gap-6 items-center text-2xl font-semibold font-[abril]
                                    sm:text-3xl"
                                    >
                                        <AiFillProduct/>
                                        <h2>Products</h2>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                    className="flex gap-6 items-center text-2xl font-semibold font-[abril]
                                    sm:text-3xl"
                                    >
                                        <FaStoreAlt/>
                                        <h2>Store</h2>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                    className="flex gap-6 items-center text-2xl font-semibold font-[abril]
                                    sm:text-3xl"
                                    >
                                        <IoChatboxOutline/>
                                        <h2>Message</h2>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                    className="flex gap-6 items-center text-2xl font-semibold font-[abril]
                                    sm:text-3xl"
                                    >
                                        <FaRegUserCircle/>
                                        <h2>Profile</h2>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    }
                </div>
                {userData.map(
                    user => (
                        <div key={user.id}
                        className="w-[70%] flex gap-4 items-center font-[abril]"
                        >
                            <h1
                            className="w-[20%] h-[60%] text-2xl font-semibold text-gray-300 bg-blue-300 text-center rounded-[60%]
                            sm:h-[50px] sm:rounded-[50%] sm:w-[15%] flex items-center justify-center
                            "
                            >
                                {user.userName[0]}
                            </h1>
                            <div
                            className="w-[65%] flex flex-col items-left"
                            >
                                <h1
                                className="text-2xl font-bold text-gray-600"
                                >{user.userName}</h1>
                                <h2
                                className="text-2xl font-medium text-gray-300"
                                >{user.status}</h2>
                            </div>
                        </div>
                    )
                )}
                <div
                className="w-[25%] flex gap-6 justify-around"
                >
                    <FiSearch 
                    className={`text-2xl sm:text-4xl" ${showSearchBar? "hidden" : "flex"}`}
                    onClick={onClickSearchIcon}
                    />
                    <IoMdNotificationsOutline
                    className="text-2xl  sm:text-4xl"
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
            className="w-full flex"
            >
                {/* <SideBar /> */}
                <div
                className="w-full h-[100px] flex flex-col"
                >
                    <div
                    className="w-[100%] h-[60px] flex items-center"
                    >
                        <form onSubmit={onSubmit}
                        className="w-[90%] flex px-2 py-2  bg-white gap-2 bg-black"
                        >
                            <input type="search" placeholder="search"
                            className="w-[90%] h-[50px] border-2 border-gray-900 rounded-lg px-2 text-2xl font-medium font-[abril] focus:outline-none"
                            />
                            <button
                            >
                                <FiSearch 
                                className="text-4xl"
                                />
                            </button>
                        </form>
                        <IoMdNotificationsOutline
                        className="text-4xl"
                        />
                    </div>
                    {userData.map(
                        user => (
                            <div key={user.id}
                            className="w-full flex gap-2 px-4 py-2"
                            >
                                <h1
                                className="text-4xl font-semibold font-[abril] text-gray-500"
                                >Welcome,</h1>
                                <h1
                                className="text-4xl font-bold font-[abril] text-gray-900"
                                >{user.userName}</h1>
                            </div>
                        )
                    )}
                </div>
            </div>
            }
        </>
    )

}

export default Header;


