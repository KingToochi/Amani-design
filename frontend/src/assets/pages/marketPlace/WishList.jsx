import { FaHeart } from "react-icons/fa6";
import { WishiListContext } from "./hooks/WishListContext";
import { useContext } from "react";
import { Link } from "react-router-dom";

const  WishList = () => {
const [wishList, setWishList] = useContext(WishiListContext)

const removeFromWishList = (_id) => {
    setWishList(prevWishList =>
        prevWishList.filter(wish => (wish._id !== _id) )
    )
}


if (wishList.length == 0) return (
    <div className="text-gray-500">No item added yet</div>
)

return(
    <div
    className="w-full min-h-screen mb-[75px] colums-2 gap-2 text-gray-500 columns-2 text-lg 
    sm:text-xl
    md:columns-3 md:text-2xl
    lg:columns-4
    "
    >
        {
            wishList.map(wish => (
                <div key={wish._id}

                className="relative"
                >
                    <button onClick={()=> removeFromWishList(wish._id)}
                    className="absolute right-0 bg-zinc-500 w-[40px] h-[40px] mx-1 mt-1 rounded-full"     
                    >
                        <FaHeart className="text-red-500 text-xl mx-auto" />
                    </button>
                    <Link to={`/product-details/${wish._id}`}>
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