import Logo from "./Logo";
import DropDownBar, { WishList, ShoppingCart } from "./Icons";
const Header = () => {
    return ( 
        <div
        className="w-full flex justify-between items-center px-4
        
        "
        >
            <DropDownBar />
            <Logo />
            <ShoppingCart />
            <WishList />
        </div>
    )
}
 
export default Header;