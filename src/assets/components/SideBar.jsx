import Logo from "./Logo";
import MenuBar from "./Icons"
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

const SideBar = () => {
    const [dropDown, setDropDown] = useState(false);
   const  handleClick = ( ) => {
        setDropDown((prev) => !prev);
   }
    return ( 
        <div
        className="w-[30%]
        lg:w-[15%]
        "
        >
            <MenuBar 
            onClick={handleClick}
            className={`px-2 py-2 ${dropDown ? "hidden" : "block"} text-2xl text-gray-500 hover:text-gray-700 cursor-pointer lg:hidden`}
            />
            {dropDown && (
                <div
                className="w-full min-h-screen flex  flex-col items-center gap-8 px-2 py-2 border-r-2 border-gray-300"
                >   
                    <h2
                    onClick={handleClick}
                    className={` ${dropDown ? "block" : "hidden" }` }
                    >
                        x
                    </h2>
                    <Logo
                    className={"w-full flex gap-2 items-center "}
                    ImageClassName={"w-[30px] h-[30px] rounded-[50%]"}
                    textClassName={"text-xs font-[abril] font-bold text-center"}
                    />
                    <nav
                    className="w-full h-auto"
                    >
                        <ul
                        className="flex flex-col font-[abril] justify-center text-xl font-medium gap-4 px-2"
                        >
                            <li>
                                <Link to="/dashboard">Home</Link>
                            </li>

                            <li>
                                <Link to="/home">Product</Link>
                            </li>

                            <li>
                                <Link to="/home">Order</Link>
                            </li>

                            <li>
                                <Link to="/home">Delivery</Link>
                            </li>

                            <li>
                                <Link to="/home">Contact</Link>
                            </li>
                        </ul>
                    </nav>
                </div>
            )}

            {/* sidebar for big screen */}
            <div
                className="hidden w-full min-h-screen flex-col items-center gap-8 px-2 py-2 border-r-2 border-gray-300
                lg:flex
                "
                >   
                    <Logo
                    className={"w-full flex gap-2 items-center "}
                    ImageClassName={"w-[50px] h-[50px] rounded-[50%]"}
                    textClassName={"text-2xl font-[abril] font-bold text-center"}
                    />
                    <nav
                    className="w-full h-auto "
                    >
                        <ul
                        className="flex flex-col font-[abril] pl-10 text-xl font-medium gap-8 px-2 "
                        >
                            <li>
                                <Link to="/dashboard">Home</Link>
                            </li>

                            <li>
                                <Link to="/home">Products</Link>
                            </li>

                            <li>
                                <Link to="/home">Order</Link>
                            </li>

                            <li>
                                <Link to="/home">Delivery</Link>
                            </li>

                            <li>
                                <Link to="/home">Contact</Link>
                            </li>
                        </ul>
                    </nav>
                </div>
        </div>
     );
}
 
export default SideBar;