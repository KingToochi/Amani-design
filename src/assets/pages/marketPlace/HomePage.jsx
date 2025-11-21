import { useState, useEffect } from "react";
import { FiHeart } from "react-icons/fi";
import { Link } from "react-router-dom";


const Homepage = () => {
    const [trendingDesigns, setTrendingDesigns] = useState([])

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
                <div
                className="w-full flex relative"
                >
                    <Link key={design.id} to={`/product-details/${design.id}`}
                    >
                        <img 
                        className="rounded-lg break-inside-avoid mb-2"
                        src={design.productImage} alt="images"/>
                    </Link>
                    <button 
                     className="bg-zinc-500  w-[40px] h-[40px] mx-1 mt-2 rounded-full absolute float-right  right-0 cursor-pointer"
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