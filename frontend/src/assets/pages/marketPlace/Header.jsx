import Logo from "../../components/Logo";
import { IoMdNotificationsOutline } from "react-icons/io";
import { GiShoppingCart } from "react-icons/gi";
import { FiSearch } from "react-icons/fi";
import logo from "../../images/mainLogo.jpg"
const Header = () => {


    return (
        <div 
        className="w-full flex"
        >
           <img src={logo} alt="AmaniSky Logo"
           className="w-[50px] h-[50px] rounded-full mx-auto my-4
           md:w-[70px] md:h-[70px]
           lg:w-[100px] lg:h-[100px]
           "
           />
        </div>
    )
}

export default Header;