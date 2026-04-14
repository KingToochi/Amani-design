import { createContext, useState} from "react";

export const WishiListContext = createContext();

const MyWishList = ({children}) => {
    const [wishList, setWishList] = useState([])

    return (
        <WishiListContext value={[wishList, setWishList]}>
            {children}
        </WishiListContext>
    )
}

export default MyWishList;