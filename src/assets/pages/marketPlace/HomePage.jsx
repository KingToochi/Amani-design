import { useState, useEffect, useContext} from "react";
import { FiHeart } from "react-icons/fi";
import { Link } from "react-router-dom";
import { WishiListContext } from "./hooks/WishListContext";



const Homepage = () => {
    const [trendingDesigns, setTrendingDesigns] = useState([])
    const [wishList, setWishList] = useContext(WishiListContext)

    const fetchDesigns = async () => {
        try {
            let response = await fetch("http://localhost:3000/products")
            let data = await response.json()
            setTrendingDesigns(data)
                
        } catch (error) {
            console.log(error)
        }
        
    }

    useEffect(() => {
        fetchDesigns()
    }, [])

    const addToWishList = (design) => {
        setWishList(
            prevWishList =>{
                const exist = prevWishList.some(
                    item => item.id === design.id)
                return exist ?
                prevWishList.filter(item => item.id !== design.id)
                : [...prevWishList, design]
            }
        )
    }

    return (
        <div 
        className="flex flex-col text-gray-50 text-lg font-[abril] px-4 py-4 gap-4
        sm:text-xl
        md-text-2xl 
        
        "
        >
            <ul
            className="hidden w-full items-center justify-between text-lg
            sm:flex
            "
            >
                <li className=" border-1 rounded-lg px-2">
                    <Link>Clothings</Link>
                </li>

                <li  className=" border-1 rounded-lg px-2">
                    <Link>Footwears</Link>
                </li>

                <li  className=" border-1 rounded-lg px-2">
                    <Link>Handbags/Purses</Link>
                </li>

                <li  className=" border-1 rounded-lg px-2">
                    <Link>Accessories</Link>
                </li>
            </ul>
            <div
            className="columns-2 gap-2
            md:columns-3
            lg:columns-4
            "
            >
            {trendingDesigns.map(design =>(
                <div key={design.id}
                className="w-full flex relative"
                >
                    <Link key={design.id} to={`/product-details/${design.id}`}
                    >
                        <img 
                        className="rounded-lg break-inside-avoid mb-2"
                        src={design.productImage} alt="images"/>
                    </Link>
                    <button onClick={() => addToWishList(design)}
                     className={`${wishList.some(item => item.id === design.id) ? "text-red-300" : "text-gray-50"} bg-zinc-500  w-[40px] h-[40px] mx-1 mt-2 rounded-full absolute  right-0 cursor-pointer`}
                    >
                        <FiHeart
                        className="text-xl mx-auto"
                        />
                    </button>
                </div>
            ))}
           </div>
        </div>
    )

}

export default Homepage;