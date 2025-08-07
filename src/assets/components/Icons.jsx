import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const ShoppingCart = ({className}) => {
    return (
        <div className={className}>
            <FontAwesomeIcon 
            icon="fa fa-shopping-cart" />
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
            icon="fa fa-heart" />
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
            icon="fa fa-user" />
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
            icon="fa fa-bars" />
        </div>
     );
}
 
export default MenuBar;
