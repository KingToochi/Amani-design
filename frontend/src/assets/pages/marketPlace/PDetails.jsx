import { useParams } from "react-router-dom"
import { useState, useEffect, useContext } from "react"
import { FiArrowLeft } from "react-icons/fi"
import { FaNairaSign } from "react-icons/fa6"
import { TbCurrencyNaira } from "react-icons/tb"
import { CartContext } from "./hooks/CartContext"
import { BASE_URL } from "../../Url"

const PDetails = () => {
    const url = BASE_URL
    const {_id} = useParams()
    const [productDetails, setProductDetails] = useState([])
    const [cart, setCart] = useContext(CartContext);
    const [quantity, setQuantity] = useState(1)


    const  fetchProduct = async() => {
        console.log(_id)
        try {
            let response = await fetch(`${url}/products/${_id}`)
            let data = await response.json()
            setProductDetails(data)
        
        } catch(error) {
            console.log(error)
        }
    }

    useEffect(() => {
        fetchProduct()
    }, [])

    const handleCart = () => {

        setCart(prevCart => {
            const  existing = prevCart.find(item => item.id === productDetails.id)

            if (existing) {
                return prevCart.map(item =>
                    item.id === productDetails.id
                    ? {...item, quantity: item.quantity + quantity}
                    : item
                )
            }else {
                return[...prevCart, {...productDetails, quantity}]
            }
        })

        console.log(cart)
        
        
    }



    return(
        <div className="flex flex-col gap-4 pt-2 px-2 w-full min-h-screen text-gray-500 text-lg font-[abril] mb-[75px]
        sm:text-xl
        md:text-2xl
        ">
            <h1>Product Name</h1>
            <div
            className="flex flex-col gap-4 
            md:flex-row
            "
            >
                <img src={productDetails.productImage}
                className="rounded-lg
                 md:w-[50%] md:max-h-screen
                "
                />
                <div
                className="mt-4 flex flex-col px-6 gap-4
                md:w-1/2 
                "
                >
                    <h1
                    className="flex items-center gap-2"
                    ><TbCurrencyNaira /> {productDetails.productPrice}</h1>
                    <h1>{productDetails.productCategory}</h1>
                    <h1>Size: xl </h1>
                    <h1>color: Black</h1>
                    <div 
                    className="w-full flex justify-between text-gray-50 "
                    >
                        <button 
                        className="border-1 px-2 rounded-lg bg-blue-700 cursor-pointer"
                        >
                            <h1>Buy</h1>
                        </button>
                        <button onClick={handleCart}
                        className="border-1 px-2 rounded-lg bg-pink-700 cursor-pointer"
                        >
                            <h1>Add to Cart</h1>
                        </button>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default PDetails