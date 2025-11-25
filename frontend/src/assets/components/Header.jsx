import Logo from "./Logo";
import MenuBar, { WishList, ShoppingCart, UserLogo } from "./Icons";
const Header = () => {
    return ( 
        <div
        className="w-full flex justify-between items-center px-4
        
        "
        >
            <MenuBar/>
            <WishList 
            className="group relative"
            />
            <Logo />
            <WishList 
            className="group relative hidden
            lg:flex
            "
            />

            <ShoppingCart 
            className="group relative"
            />
            <UserLogo
            className="group relative"
            />
        </div>
    )
}
 
export default Header;