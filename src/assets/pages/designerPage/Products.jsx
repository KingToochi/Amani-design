import { useState, useEffect } from "react";

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
            <div className="w-full">
                <h1>
                    No product yet
                </h1>

            </div>

            : welcome
        }
        </>
    )
}

export default Products;