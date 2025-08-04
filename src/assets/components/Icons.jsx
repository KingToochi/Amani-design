import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useState } from "react"
export const WishList = () => { 
    return (
        <div>
            <FontAwesomeIcon icon="fa fa-heart" />
        </div>
    )

}

export const ShoppingCart = () => {
    return (
        <div>
            <FontAwesomeIcon icon="fa fa-shopping-cart" />
            <span></span>
        </div>
    )
}

const DropDownBar = () => {
    return ( 
        <div>
            <FontAwesomeIcon icon="fa fa-bars" />
        </div>
     );
}
 
export default DropDownBar;