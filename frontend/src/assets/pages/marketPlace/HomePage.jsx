import { useState, useEffect, useContext} from "react";
import { FaHeart, FaMessage } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { WishiListContext } from "./hooks/WishListContext";
import { BASE_URL} from "../../Url";  
import { BiSolidLike } from "react-icons/bi";
import { LikeContext } from "./hooks/Like";
import {AuthContext} from "./hooks/AuthProvider"




const Homepage = () => {
    const url = BASE_URL;
    const [designs, setDesigns] = useState([])
    const [wishList, setWishList] = useContext(WishiListContext)
    const [like, setLike] = useContext(LikeContext)
    const {auth, isLoggedIn} = useContext(AuthContext)
    const token = localStorage.getItem("token") 
    


    const fetchDesigns = async () => {
        try {
            let response = await fetch(`${url}/products`)
            let data = await response.json()
            setDesigns(data)

        } catch (error) {
            console.log(error)
        }
        
    }

    const fetchLikes =  async() => {
        try {
            let response = await fetch (`${url}/likes`, {
                method: "GET",
                headers: {
                    "Authorization" : `Bearer ${token}`
                }
            })
            let data = await response.json()
            if (data.success) {
                setLike(prev => [...prev, ...data.likedProducts])

            }
            console.log(data)
        } catch(error){
            console.log(error)
        }
    }

    useEffect(() => {
        fetchDesigns()
    }, [])
    useEffect(() => {
        if (isLoggedIn) {
            fetchLikes()
        }
}, [isLoggedIn])

    const addToWishList = (design) => {
        setWishList(
            prevWishList =>{
                const exist = prevWishList.some(
                    item => item._id === design._id)
                return exist ?  
                prevWishList.filter(item => item._id !== design._id)
                : [...prevWishList, design]
            }
                )
    }

    const likeProduct = async (design) => {
        const exist = like.some(item => item.productId === design._id)
        if (exist) {
            setLike(prev => prev.filter(item => item.productId !== design._id))
        }else {
            setLike(prev => [...prev, {productId: design._id, userId: auth.id}])
        }

       try {
            let response = await fetch(`${url}/like`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({productId: design._id})
            })
            let data = await response.json()
            console.log(data)
       } catch(error) {
        console.log(error)
       }
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
                <li className="flex-shrink-0 border-1 rounded-lg px-2 bg-gray-500 cursor-pointer  ">
                    <Link>Men's Clothing</Link>
                </li>

                <li  className="flex-shrink-0 border-1 rounded-lg px-2 bg-gray-500 cursor-pointer">
                    <Link>Men's Footwears</Link>
                </li>
                <li  className="flex-shrink-0 border-1 rounded-lg px-2 bg-gray-500 cursor-pointer">
                    <Link>Women's Footwears</Link>
                </li>
                <li className="flex-shrink-0 border-1 rounded-lg px-2 bg-gray-500 cursor-pointer">
                    <Link>Women's Clothing</Link>
                </li>

                <li  className="flex-shrink-0 border-1 rounded-lg px-2 bg-gray-500 cursor-pointer">
                    <Link>Men's handBag/purse</Link>
                </li>

                <li  className="flex-shrink-0 border-1 rounded-lg px-2 bg-gray-500 cursor-pointer">
                    <Link>Women's handBag/purse</Link>
                </li>

                 <li  className="flex-shrink-0 border-1 rounded-lg px-2 bg-gray-500 cursor-pointer">
                    <Link>Men's Clothing Accessories</Link>
                </li>

                 <li  className="flex-shrink-0 border-1 rounded-lg px-2 bg-gray-500 cursor-pointer">
                    <Link>Women's Clothing Accessories</Link>
                </li>

                <li  className="flex-shrink-0 border-1 rounded-lg px-2 bg-gray-500 cursor-pointer">
                    <Link>Kid's Clothing</Link>
                </li>

                <li  className="flex-shrink-0 border-1 rounded-lg px-2 bg-gray-500 cursor-pointer">
                    <Link>Kid's Footwear</Link>
                </li>

                <li  className="flex-shrink-0 border-1 rounded-lg px-2 bg-gray-500 cursor-pointer">
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
                <div key={design._id}
                className="w-full flex relative"
                >
                    <Link key={design._id} to={`/product-details/${design._id}`}
                    >
                        <img 
                        className="rounded-lg break-inside-avoid mb-2"
                        src={design.productImage} alt="images"/>
                    </Link>
                    <div
                    className="flex flex-col absolute  right-0 gap-4"
                    >
                        <button onClick={() => addToWishList(design)}
                        className={`${wishList.some(item => item._id === design._id) ? "text-red-500" : "text-gray-50"} bg-zinc-500  w-[40px] h-[40px] mx-1 mt-2 rounded-full cursor-pointer`}
                        >
                            <FaHeart
                            className="text-xl mx-auto"
                            />
                        </button>

                        <button  onClick={() => likeProduct(design)}
                        className={`${like.some(product => product.productId === design._id) ? "text-blue-500" : "text-gray-50"} ${isLoggedIn ? "block" : "hidden"} bg-zinc-500  w-[40px] h-[40px] mx-1 mt-2 rounded-full cursor-pointer`}
                        >
                            <BiSolidLike
                            className="text-xl mx-auto" />                  
                        </button>
                    </div>
                    
                </div>
            ))}
           </div>
        </div>
    )

}


export default Homepage;