import Header from "../../components/Header";
import HeroBanner from "../../components/HeroBanner";
import Categories from "../../components/Categories";
import { useState, useEffect } from "react";
import { BASE_URL } from "../../Url";
import Footer from "../../components/Footer";
import NewArrival from "../../components/NewArrival";


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
            <Categories/>
            {/* <NewArrival products={product} /> */}
            <Footer/>
        </div>
    )
}

export default HomePage;