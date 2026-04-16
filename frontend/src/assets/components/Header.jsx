import logo from "../images/mainLogo.jpg"
import { Link } from "react-router-dom";
import { MdMenu } from "react-icons/md"
import { FaRegUser } from "react-icons/fa";
import { MdOutlineShoppingBag } from "react-icons/md";
import { FaSearch } from "react-icons/fa";
import { useState } from "react";
import SearchBar from "./SearchBar";
import Search from "../pages/marketPlace/SearchPage";
import {BASE_URL} from "../Url";

const Header = () => {
    const [dropDown, setDropDown] = useState(false);
    const [showSearchBar, setShowSearchBar] = useState(false)
    const [query, setQuery] = useState("")
    const [searchedProduct, setSearchedProduct] = useState([])
    const [showSearchedProduct, setShowSearchedProduct] = useState(false)
    const url = BASE_URL
     const handleChange = (e) => {
        setQuery(e.target.value)
    }
    const handleClick = () => {
        setDropDown((prev) => !prev);
        setShowSearchedProduct(false)
        setShowSearchedProduct(false)
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
        <div className="fixed z-50 top-0 w-full flex h-auto bg-gray-50 font-[abril] text-gray-900 items-center justify-between px-3 sm:px-4 py-2 gap-2 sm:gap-4">
            
            {/* Logo Section */}
            <div className="flex w-auto min-w-[120px] sm:w-[30%] md:w-[30%] lg:w-[15%] items-center gap-1 sm:gap-2">
                <img 
                    src={logo} 
                    alt="Amani Design Logo" 
                    className="w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] rounded-full object-cover"
                />
                <h1 className="text-xs sm:text-sm md:text-base font-semibold flex flex-col leading-tight">
                    AmaniSky 
                    <span className="text-[10px] sm:text-xs md:text-sm">FashionWorld</span>
                </h1>
            </div>

            {/* Right Section */}
            <div className="flex-1 flex items-center justify-end gap-2 sm:gap-4">
                
                {/* Desktop Navigation - Hidden on mobile/tablet */}
                <ul className="hidden lg:flex w-[50%] xl:w-[60%] justify-between items-center gap-4 xl:gap-8 text-sm xl:text-base">
                    <li>
                        <Link to="/products">All Products</Link>
                    </li>
                    <li>
                        <Link to="/">Women</Link>
                    </li>
                    <li>
                        <Link to="/">Men</Link>
                    </li>
                    <li>
                        <Link to="/">Accessories</Link>
                    </li>
                    <li>
                        <Link to="/">New Arrival</Link>
                    </li>
                </ul>

                {/* Search Section */}
                <div className="hidden md:block lg:hidden xl:block relative flex-1 max-w-[300px]">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm" />
                    <input 
                        type="text" 
                        placeholder="Search products..." 
                        className="w-full pl-8 pr-3 py-1.5 sm:py-2 rounded-full bg-cyan-50 border border-gray-300 focus:outline-none focus:border-amber-500 text-sm"
                    />
                </div>

                {/* Mobile Search Icon */}
                <div>
                    <FaSearch  className="block md:hidden text-base sm:text-lg cursor-pointer"
                    onClick={()=>setShowSearchBar(true)}
                    />
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

                </div>

                {/* User & Cart Icons */}
                <div className="flex items-center gap-3 sm:gap-4">
                    <Link to="/profile"><FaRegUser className="text-base sm:text-lg cursor-pointer" /></Link>
                    <div className="relative">
                        <Link to="/cart"><MdOutlineShoppingBag className="text-base sm:text-lg cursor-pointer" /></Link>
                        <span className="absolute -top-2 -right-2 bg-amber-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">0</span>
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <div className="relative lg:hidden">
                    <MdMenu 
                        className="text-2xl sm:text-3xl cursor-pointer"
                        onClick={handleClick}
                    />
                    
                    {/* Dropdown Menu */}
                    {dropDown && (
                        <div className="absolute top-10 right-0 w-48 bg-white rounded-lg shadow-xl py-2 z-[60] border border-gray-200">
                            <ul className="flex flex-col">
                                <li className="px-4 py-3 border-b border-gray-100">
                                    <Link to="/products" className="block w-full" onClick={() => setDropDown(false)}>Store</Link>
                                </li>
                                <li className="px-4 py-3 border-b border-gray-100">
                                    <Link to="/" className="block w-full" onClick={() => setDropDown(false)}>Women</Link>
                                </li>
                                <li className="px-4 py-3 border-b border-gray-100">
                                    <Link to="/" className="block w-full" onClick={() => setDropDown(false)}>Men</Link>
                                </li>
                                <li className="px-4 py-3 border-b border-gray-100">
                                    <Link to="/" className="block w-full" onClick={() => setDropDown(false)}>Accessories</Link>
                                </li>
                                <li className="px-4 py-3">
                                    <Link to="/" className="block w-full" onClick={() => setDropDown(false)}>New Arrivals</Link>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
        {showSearchedProduct &&
                <div className="w-full z-[60] absolute top-[0] right-0 left-0 backdrop-blur text-gray-700 text-lg mt-[100px]
                sm-text-xl
                md:text-2xl
                ">
                    <Search searchedProduct = {searchedProduct} setShowSearchedProduct = {setShowSearchedProduct} setShowSearchBar = {setShowSearchBar}/>
                </div>
            }
        </>
    )
}

export default Header;