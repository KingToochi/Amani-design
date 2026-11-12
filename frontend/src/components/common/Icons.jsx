import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart, faHeart, faUser, faBars } from "@fortawesome/free-solid-svg-icons";

export const ShoppingCart = ({className}) => {
    return (
        <div className={className}>
            <FontAwesomeIcon 
            icon={faShoppingCart} />
            <h6
            className="hidden group-hover:flex absolute text-xs text-gray-300 w-auto"
            >Selected items</h6>
            <span>{" "}</span>
            </div>
    );
}

export const WishList = ({className}) => {
    return (
        <div 
        className={className}>
            <FontAwesomeIcon 
            icon={faHeart} />
            <h6
            className="hidden group-hover:flex absolute text-xs text-gray-300 w-auto"
            >Wishlist</h6>
        </div>
        
    );
}

export const UserLogo = ({className}) => {
    return (
        <div className={className}>
            <FontAwesomeIcon 
            icon={faUser} />
            <h6
            className="hidden group-hover:flex absolute text-xs text-gray-300 w-auto"
            >User details</h6>
        </div>
    )
}


const MenuBar = ({className, onClick}) => {
    return ( 
        <div className={className}>
            <FontAwesomeIcon 
            onClick={onClick}
            icon={faBars} />
        </div>
     );
}
 
export default MenuBar;
