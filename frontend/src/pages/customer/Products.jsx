import { useState, useEffect, useContext} from "react";
import { FaHeart, FaMessage } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { WishiListContext } from "../../context/WishlistContext";
import { BASE_URL} from "../../Url";  
import { BiSolidLike } from "react-icons/bi";
import { LikeContext } from "../../context/LikeContext";
import {AuthContext} from "../../context/AuthContext"
import Slide from "../../components/product/SlideShow";
import { matchesCategory } from "../../utils/categoryMatcher";
import { useNavigate} from "react-router-dom";
import ProductLikes from "../../components/common/productLikes";




const Products = () => {
    
    const url = BASE_URL;
    const [designs, setDesigns] = useState([])
    const [activeCategory, setActiveCategory] = useState("all")
    const [wishList, setWishList] = useContext(WishiListContext)
    const [like, setLike] = useContext(LikeContext)
    const {auth, isLoggedIn} = useContext(AuthContext) 
    const [productLikes, setProductLikes] = useState([])
    const navigate = useNavigate()
    


    const fetchDesigns = async () => {
        try {
            let response = await fetch(`${url}/products`)
            let data = await response.json()
            const normalizedProducts = Array.isArray(data) ? data : data.products || [];
            setDesigns(normalizedProducts)

        } catch (error) {
            console.log(error)
        }
        
    }

    const fetchLikes =  async() => {
        try {
            let response = await fetch (`${url}/likes`, {
                method: "GET",
                credentials: "include"
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
    const fetchProductLikes = async() => {
      try{
          let response = await fetch(`${url}/likes/product`,{
            method : "GET"
            })

            const likes = await response.json()
            setProductLikes(likes)
            console.log(likes)
        }catch(error){
            console.error("Error fetching product likes:", error);
        }
    }

    useEffect(() => {
        fetchDesigns()
        fetchProductLikes()
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
        if (!isLoggedIn) {
            navigate("/login")
            return
        }
        const exist = like.some(item => item.productId === design._id)
        if (exist) {
            setLike(prev => prev.filter(item => item.productId !== design._id))
        }else {
            setLike(prev => [...prev, {productId: design._id, userId: auth.id}])
        }

       try {
            let response = await fetch(`${url}/likes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({productId: design._id})
            })
            let data = await response.json()
            console.log(data)
       } catch(error) {
        console.log(error)
       }
}


    const categories = [
        { key: "all", label: "All" },
        { key: "men-clothing", label: "Men's Clothing" },
        { key: "men-footwear", label: "Men's Footwear" },
        { key: "women-footwear", label: "Women's Footwear" },
        { key: "women-clothing", label: "Women's Clothing" },
        { key: "men-bags", label: "Men's Bags" },
        { key: "women-bags", label: "Women's Bags" },
        { key: "men-accessories", label: "Men's Accessories" },
        { key: "women-accessories", label: "Women's Accessories" },
        { key: "kids-clothing", label: "Kid's Clothing" },
        { key: "kids-footwear", label: "Kid's Footwear" },
        { key: "kids-accessories", label: "Kid's Accessories" }
    ];

    const filteredDesigns = designs.filter((design) => matchesCategory(design, activeCategory));
    const formattedProductLikes = ProductLikes(productLikes);

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
                {categories.map((category) => (
                    <li
                        key={category.key}
                        className={`flex-shrink-0 border rounded-lg px-2 py-1 cursor-pointer ${activeCategory === category.key ? "bg-amber-600 text-white" : "bg-stone-800"}`}
                        onClick={() => setActiveCategory(category.key)}
                    >
                        <button type="button" className="w-full text-left">{category.label}</button>
                    </li>
                ))}
            </ul>
            <div
            className="columns-2 gap-2
            md:columns-3
            lg:columns-4
            "
            >
            {filteredDesigns.map(design =>(
                <div key={design._id}
                className="w-full flex relative"
                >
                    <Link key={design._id} to={`/product-details/${design._id}`}
                    >
                        <Slide imageArray={design.productImages} alt={design.productName} className="rounded-lg break-inside-avoid mb-2"/>

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
                        className={`${like.some(product => product.productId === design._id) ? "text-blue-500" : "text-gray-50"} flex items-center justify-center gap-1 bg-zinc-500  w-[40px] h-[40px] mx-1 mt-2 rounded-full cursor-pointer`}
                        >
                            <BiSolidLike
                            className="text-xl" />
                            <sup className={`${like.some(product => product.productId === design._id) ? "text-blue-100" : "text-gray-100"} text-[10px]`}>
                                {formattedProductLikes.find(like => like._id === design._id)?.displayLikes ?? 0}
                            </sup>
                        </button>
                    </div>
                    
                </div>
            ))}
           </div>
        </div>
    )

}


export default Products;