import Header from "../../components/layout/Header";
import HeroBanner from "../../components/product/HeroBanner";
import Categories from "../../components/product/Categories";
import { useState, useEffect } from "react";
import { BASE_URL } from "../../Url";
import Footer from "../../components/layout/Footer";
import NewArrival from "../../components/product/NewArrival";
import { Link } from "react-router-dom";


const HomePage = () => {
    const [product, setProduct] = useState([])
    const [newArrival, setNewArrival] = useState([])
  
   

    const url = BASE_URL

    
    return (
        <div className="w-full relative">
            <Header/>
            <HeroBanner/>
            <div className="px-4 py-6 text-center">
                <Link to="/products" className="inline-flex items-center rounded-full bg-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-amber-700">
                    Explore the Collection
                </Link>
            </div>
            <Categories/>
            {/* <NewArrival products={product} /> */}
            <Footer/>
        </div>
    )
}

export default HomePage;