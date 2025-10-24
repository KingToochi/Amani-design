import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AddProduct from "./AddProduct";

const Products = () => {
    const [productList, setProductList] = useState([])
    const fetchProduct = async () => {
        try{
            let response = await fetch ("http://localhost:3000/products")
            const products = await response.json()
            setProductList(products)
        }catch(error) {
            console.log(error)
        }
    }

    useEffect(() => 
        {
            fetchProduct()
        }, [])

    return(
        <>
        {
            (productList.length < 1) 
            ?
            <div className="w-full min-h-screen flex flex-col items-center mt-6 gap-6">
                <h1
                className="text-2xl font-semibold font-[abril] text-gray-700
                md:text-3xl
                "
                >
                    No product yet
                </h1>
                <button
                className="w-auto border-2 border-gray-500 rounded-lg px-2 py-2"
                >
                    <Link
                    className="text-xl font-semibold font-[abril] text-gray-700
                md:text-2xl
                "
                    >
                        Add Product
                    </Link>
                </button>
            </div>

            : welcome
        }
        </>
    )
}

export default Products;