import { useState, useEffect, useContext} from "react";
import { FiHeart } from "react-icons/fi";
import { Link } from "react-router-dom";
import { WishiListContext } from "./hooks/WishListContext";
import { BASE_URL} from "../../Url";  



const Homepage = () => {
    const url = BASE_URL;
    const [designs, setDesigns] = useState([])
    const [wishList, setWishList] = useContext(WishiListContext)

    const fetchDesigns = async () => {
        try {
            let response = await fetch(`${url}/products`)
            let data = await response.json()
            setDesigns(data)

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
        className="flex flex-col text-gray-50 text-lg font-[abril] px-2 gap-4
        sm:text-xl
        md-text-2xl 
        
        "
        >
            <ul
            className=" w-full flex items-center gap-4 text-lg overflow-x-auto px-2 flex-nowrap
            sm:flex h-[50px]
            md:h-[70px]
            "
            >
                <li className="flex-shrink-0 border-1 rounded-lg px-2 bg-gray-500  ">
                    <Link>Men's Clothing</Link>
                </li>

                <li  className="flex-shrink-0 border-1 rounded-lg px-2 bg-gray-500">
                    <Link>Men's Footwears</Link>
                </li>
                <li  className="flex-shrink-0 border-1 rounded-lg px-2 bg-gray-500">
                    <Link>Women's Footwears</Link>
                </li>
                <li className="flex-shrink-0 border-1 rounded-lg px-2 bg-gray-500">
                    <Link>Women's Clothing</Link>
                </li>

                <li  className="flex-shrink-0 border-1 rounded-lg px-2 bg-gray-500">
                    <Link>Men's handBag/purse</Link>
                </li>

                <li  className="flex-shrink-0 border-1 rounded-lg px-2 bg-gray-500">
                    <Link>Women's handBag/purse</Link>
                </li>

                 <li  className="flex-shrink-0 border-1 rounded-lg px-2 bg-gray-500">
                    <Link>Men's Clothing Accessories</Link>
                </li>

                 <li  className="flex-shrink-0 border-1 rounded-lg px-2 bg-gray-500">
                    <Link>Women's Clothing Accessories</Link>
                </li>

                <li  className="flex-shrink-0 border-1 rounded-lg px-2 bg-gray-500">
                    <Link>Kid's Clothing</Link>
                </li>

                <li  className="flex-shrink-0 border-1 rounded-lg px-2 bg-gray-500">
                    <Link>Kid's Footwear</Link>
                </li>

                <li  className="flex-shrink-0 border-1 rounded-lg px-2 bg-gray-500">
                    <Link>Kid's Clothing Accessories</Link>
                </li>
                
            </ul>
            <div
            className="columns-2 gap-2
            md:columns-3
            lg:columns-4
            "
            >
            {designs.map(design =>(
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