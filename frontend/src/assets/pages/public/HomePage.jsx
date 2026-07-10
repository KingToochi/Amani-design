import Header from "../../components/Header";
import HeroBanner from "../../components/HeroBanner";
import Categories from "../../components/Categories";
import { useState, useEffect } from "react";
import { BASE_URL } from "../../Url";
import Footer from "../../components/Footer";
import NewArrival from "../../components/NewArrival";
import { Link } from "react-router-dom";


const HomePage = () => {
    const [product, setProduct] = useState([])
    const [newArrival, setNewArrival] = useState([])
  
   

    const url = BASE_URL

    // const fetchProduct = async () => {
    //     try {
    //         setLoading(true)
    //         let response = await fetch(`${url}/products`)
            
    //         if (!response.ok) {
    //             throw new Error(`HTTP error! status: ${response.status}`)
    //         }
            
    //         let data = await response.json()
    //         console.log("Fetched products:", data)
    //         setProduct(data)
    //         setError(null)
    //     } catch(error) {
    //         console.log(error)
    //         setError(error.message)
    //     } finally {
    //         setLoading(false)
    //     }
    // }

    // useEffect(() => {
    //     fetchProduct()
    // }, [])

    
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