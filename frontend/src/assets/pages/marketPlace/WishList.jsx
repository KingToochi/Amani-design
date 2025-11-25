import { FiHeart } from "react-icons/fi";
import { WishiListContext } from "./hooks/WishListContext";
import { useContext } from "react";
import { Link } from "react-router-dom";

const  WishList = () => {
const [wishList, setWishList] = useContext(WishiListContext)

const removeFromWishList = (id) => {
    setWishList(prevWishList =>
        prevWishList.filter(wish => (wish.id !== id) )
    )
}


if (wishList.length == 0) return (
    <div className="text-gray-50">No item added yet</div>
)

return(
    <div
    className="w-full min-h-screen mb-[75px] colums-2 gap-2 text-gray-50 columns-2 text-lg 
    sm:text-xl
    md:columns-3 md:text-2xl
    lg:columns-4
    "
    >
        {
            wishList.map(wish => (
                <div key={wish.id}

                className="relative"
                >
                    <button onClick={()=> removeFromWishList(wish.id)}
                    className="absolute right-0 bg-zinc-500 w-[40px] h-[40px] mx-1 mt-1 rounded-full"     
                    >
                        <FiHeart className="text-red-300 text-xl mx-auto" />
                    </button>
                    <Link to={`/product-details/${wish.id}`}>
                        <img src={wish.productImage}
                        className="rounded-lg break-inside-avoid mb-2"
                        />
                    </Link>
                </div>
            ))
        }
    </div>
)
}

export default WishList;