import { IoHome } from "react-icons/io5";
import { FiHeart, FiSearch } from "react-icons/fi";
import { FaHeart } from "react-icons/fa6";
import { IoMdNotificationsOutline } from "react-icons/io";
import { GiShoppingCart } from "react-icons/gi";
import { FaUser } from "react-icons/fa6";
import logo from "../../images/mainLogo.jpg"
import { Link } from "react-router-dom";
import { useState, useContext} from "react";
import { CartContext } from "./hooks/CartContext";
import {AuthContext} from "./hooks/AuthProvider"
import { BASE_URL } from "../../Url";

const Navigation = ()=> {
    const [showSearchBar, setShowSearchBar] = useState(false)
    const [cart]= useContext(CartContext)
    const onClickSearchIcon = () => setShowSearchBar((prev) => !prev)
    const {isLoggedIn, auth} = useContext(AuthContext)
    const url = BASE_URL

    const searchItem = async(event) => {
         event.preventDefault() 
         const form = event.target.value
        let response = await fetch (`${url}/search?q=${encodeURIComponent(form)}`)
        let data = await response.json()
        console.log(data)
    }

    return (
        <>
        <nav
        className="w-full h-[70px] text-gray-50 font-normal font-[abril] text-xl fixed bottom-0 z-50 backdrop-blur bg-gray-500"
        >
            <ul
            className="flex items-center gap-2 justify-between px-2"
            >
                <li>
                    <Link to="/"
                    className="flex flex-col gap-2 items-center"
                    >
                        <IoHome />
                        <h1
                        className="hidden 
                        sm:flex
                        "
                        >Home</h1>
                    </Link>
                </li>

                <li>
                    <Link to="/wishlist"
                    className="flex flex-col gap-2 items-center"
                    >
                        <FaHeart className="text-red-500" />
                        <h1
                        className="hidden 
                        sm:flex
                        "
                        >WishList</h1>
                    </Link>
                </li>

                <li>
                    <Link
                    className="flex flex-col gap-2 items-center"
                    >
                        <IoMdNotificationsOutline />
                        <h1
                        className="hidden 
                        sm:flex
                        "
                        >Notification</h1>
                    </Link>
                </li>

                <li>
                    {isLoggedIn && auth.status === "designer" 
                    ? 
                    <Link to="/designer"
                    className="flex items-center"
                    >
                        <img src={logo} alt="AmaniSky logo" 
                        className="w-[40px] h-[40px] rounded-full mx-auto my-4
                        sm:w-[50px] sm:h-[50px]
                        "
                        />
                    </Link>
                    :
                    <div 
                    className="flex items-center"
                    >
                        <img src={logo} alt="AmaniSky logo" 
                        className="w-[40px] h-[40px] rounded-full mx-auto my-4
                        sm:w-[50px] sm:h-[50px]
                        "
                        />
                    </div>
                    }
                </li>

                 <li>
                    <button onClick={onClickSearchIcon}
                    className="flex flex-col gap-2 items-center cursor-pointer"
                    >
                        <FiSearch />
                        <h1
                        className="hidden 
                        sm:flex
                        "
                        >Search</h1>
                    </button>
                </li>
                

                <li>
                    <Link to="/cart"
                    className="flex flex-col gap-2 items-center"
                    >
                        <div
                        className="flex relative items-center"
                        >
                            <GiShoppingCart />
                            <sup 
                            className={`${cart.length === 0 && "hidden"}`}
                            >
                                {cart.length}
                            </sup>
                        </div>
                        <h1
                        className="hidden 
                        sm:flex
                        "
                        >Shopping</h1>
                    </Link>
                </li>

                <li>
                    <Link to="/profile"
                    className="flex flex-col gap-2 items-center"
                    >
                        <FaUser />
                        <h1
                        className="hidden 
                        sm:flex
                        "
                        >Profile</h1>
                    </Link>
                </li>
            </ul>
        </nav>
        {
                showSearchBar && 
                <form onSubmit={(event) => searchItem(event)}
                className="min-w-screen absolute right-0 left-0 top-0 flex flex-col px-2 py-2  bg-white gap-2"
                >
                    <h1
                    onClick={onClickSearchIcon}
                    className="flex justify-end text-2xl font-bold text-red-600 px-2"
                    >X</h1>
                    <input type="search" placeholder="search"
                    className="w-[90%] h-[30px] border-2 border-gray-900 rounded-lg px-2 mx-auto text-2xl font-medium font-[abril] focus:outline-none
                    md:h-[50px]
                    "
                    />
                </form>
            }
        </>
    )
}

export default Navigation;