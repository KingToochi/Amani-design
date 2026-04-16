import { FaHome } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";
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
import Search from "./SearchPage";
import { TbLayoutGridAdd } from "react-icons/tb";
import SearchBar from "../../components/SearchBar";

const Navigation = ()=> {
    const [showSearchBar, setShowSearchBar] = useState(false)
    const [cart]= useContext(CartContext)
    const {isLoggedIn, auth} = useContext(AuthContext)
    const url = BASE_URL
    const [query, setQuery] = useState("")
    const [searchedProduct, setSearchedProduct] = useState([])
    const [showSearchedProduct, setShowSearchedProduct] = useState(false)

    const onClickSearchIcon = () => {
        setShowSearchBar((prev) => !prev)
        setShowSearchedProduct(false)
    }
     const handleChange = (e) => {
        setQuery(e.target.value)
    }

    const searchItem = async(event) => {
         event.preventDefault()
         if (!query.trim()) return
         console.log(query)
        let response = await fetch (`${url}/search?q=${encodeURIComponent(query)}`)
        let data = await response.json()
        
        setSearchedProduct(data.products)
        console.log("showSearchedProduct:", showSearchedProduct)
        setShowSearchedProduct(true)
        console.log(data)
        
    }

    



    return (
        <>
        <nav
        className="w-full h-[70px] text-gray-50 font-normal font-[abril] text-xl fixed bottom-0 z-50 backdrop-blur bg-stone-800 "
        >
            <ul
            className="flex items-center gap-2 justify-between px-2"
            >
                <li>
                    <Link to="/"
                    className="flex flex-col gap-2 items-center"
                    >
                        <FaHome/>
                        <h1
                        className="hidden 
                        sm:flex
                        "
                        >Home</h1>
                    </Link>
                </li>

                <li>
                            <Link to="/products"
                            className="flex flex-col gap-2 items-center"
                            >
                                <TbLayoutGridAdd />
                                <h1
                                className="hidden 
                                sm:flex
                                "
                                >Products</h1>
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
                    {isLoggedIn && auth.role === "designer" 
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
        {showSearchBar && 
            <div className="absolute top-0 left-0 w-full bg-gray-50 p-4 z-[60] flex flex-col gap-2">
                <span
                onClick={()=>{
                setShowSearchBar(false);
                setShowSearchedProduct(false)} }
                className="w-full text-right px-4 text-lg text-red-300 cursor-pointer">x</span>
                <SearchBar
                formClass="w-full relative h-auto"
                inputClass="w-full h-[40px] rounded-full bg-white border border-gray-300 pl-4 pr-10 focus:outline-none focus:border-amber-500 text-sm"
                buttonClass="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm"
                query={query} handleChange={handleChange} onSubmit={searchItem} onClick={searchItem}
                />
            </div>
        }
            {showSearchedProduct &&
                <div className="w-full h-auto z-[60] absolute top-[0] right-0 left-0 backdrop-blur text-gray-700 text-lg mt-[100px]
                sm-text-xl
                md:text-2xl
                ">
                    <Search searchedProduct = {searchedProduct} setShowSearchedProduct = {setShowSearchedProduct} setShowSearchBar = {setShowSearchBar}/>
                </div>
            }
        </>
    )
}

export default Navigation;