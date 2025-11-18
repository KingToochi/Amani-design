import Logo from "../../components/Logo";
import { IoMdNotificationsOutline } from "react-icons/io";
import { GiShoppingCart } from "react-icons/gi";
import { FiSearch } from "react-icons/fi";
const Header = () => {


    return (
        <div 
        className="w-full flex flex-col gap-4 font-[abril] font-[semibold] text-lg text-gray-50 "
        >
            <div
            className="w-full flex "
            >
                <Logo  
                className="w-[50%] h-auto flex items-center px-2 gap-2"
                ImageClassName="w-[50px] h-[50px] rounded-full"
                />
                <div
                className="w-1/2 flex items-center justify-end gap-10 text-2xl px-4 "
                >
                    <IoMdNotificationsOutline />
                    <div className="w-[30%]  flex items-center justify-center">
                        <GiShoppingCart />
                        <sup><span></span></sup>
                    </div>
                </div>
            </div>
            <form
            className="w-[90%] flex h-[40px] items-center bg-stone-900 border-2 border-gray-500 rounded-lg mx-auto px-2 gap-2"
            >
                <button type="submit">
                    <FiSearch />
                </button>
                <input
                className="w-[90%] focus:outline-none px-2"
                type="search" name="search" placeholder="search" />
            </form>
        </div>
    )
}

export default Header;