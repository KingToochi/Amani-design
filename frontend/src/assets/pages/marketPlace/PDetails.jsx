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
    const [productDetails, setProductDetails] = useState(null) // Start with null, not empty array
    const [cart, setCart] = useContext(CartContext);
    const [quantity, setQuantity] = useState(1)
    const [loading, setLoading] = useState(true)
    const [selectedSize, setSelectedSize] = useState('M')
    const [selectedColor, setSelectedColor] = useState('Black')

    const fetchProduct = async() => {
        try {
            let response = await fetch(`${url}/products/${_id}`)
            let data = await response.json()
            setProductDetails(data)
        } catch(error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProduct()
    }, [_id]) // Add _id as dependency

    const handleCart = () => {
        if (!productDetails) return;

        setCart(prevCart => {
            // Check if product exists in cart using _id
            const existing = prevCart.find(item => item._id === productDetails._id)

            let updatedCart;
            if (existing) {
                // Update quantity if product exists
                updatedCart = prevCart.map(item =>
                    item._id === productDetails._id
                    ? {...item, quantity: item.quantity + quantity}
                    : item
                )
                console.log(`Updated ${productDetails.productName} quantity to ${existing.quantity + quantity}`)
            } else {
                // Add new product with size and color
                updatedCart = [...prevCart, {
                    ...productDetails,
                    quantity,
                    selectedSize,
                    selectedColor
                }]
                console.log(`Added ${productDetails.productName} to cart`)
            }

            // Optional: Save to localStorage
            localStorage.setItem('cart', JSON.stringify(updatedCart))
            
            return updatedCart
        })

        // Reset quantity to 1 after adding
        setQuantity(1)
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    if (!productDetails) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <h1 className="text-xl text-gray-600">Product not found</h1>
            </div>
        )
    }

    return(
        <div className="flex flex-col gap-4 pt-2 px-2 w-full min-h-screen text-gray-500 text-lg font-[abril] mb-[75px]
        sm:text-xl
        md:text-2xl
        ">
            <h1>{productDetails.productName}</h1>
            <div
            className="flex flex-col gap-4 
            md:flex-row
            "
            >
                <img src={productDetails.productImage}
                className="rounded-lg
                 md:w-[50%] md:max-h-screen object-cover
                "
                alt={productDetails.productName}
                />
                <div
                className="mt-4 flex flex-col px-6 gap-4
                md:w-1/2 
                "
                >
                    <h1 className="flex items-center gap-2">
                        <TbCurrencyNaira /> {productDetails.productPrice}
                    </h1>
                    <h1>{productDetails.productCategory}</h1>
                    
                    {/* Size Selection */}
                    <div>
                        <h1 className="mb-2">Size:</h1>
                        <div className="flex gap-2">
                            {['XS', 'S', 'M', 'L', 'XL'].map(size => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`px-3 py-1 border rounded ${
                                        selectedSize === size 
                                        ? 'bg-black text-white' 
                                        : 'hover:bg-gray-100'
                                    }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color Selection */}
                    <div>
                        <h1 className="mb-2">Color:</h1>
                        <div className="flex gap-2">
                            {['Black', 'White', 'Blue', 'Red'].map(color => (
                                <button
                                    key={color}
                                    onClick={() => setSelectedColor(color)}
                                    className={`px-3 py-1 border rounded ${
                                        selectedColor === color 
                                        ? 'bg-black text-white' 
                                        : 'hover:bg-gray-100'
                                    }`}
                                >
                                    {color}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-4">
                        <h1>Quantity:</h1>
                        <div className="flex items-center border rounded">
                            <button 
                                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                className="px-3 py-1 hover:bg-gray-100"
                            >
                                -
                            </button>
                            <span className="px-4 py-1 border-x">{quantity}</span>
                            <button 
                                onClick={() => setQuantity(prev => prev + 1)}
                                className="px-3 py-1 hover:bg-gray-100"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <div 
                    className="w-full flex justify-between text-gray-50 mt-4"
                    >
                        <button 
                        className="border-1 px-4 py-2 rounded-lg bg-blue-700 cursor-pointer hover:bg-blue-800 transition"
                        >
                            <h1>Buy Now</h1>
                        </button>
                        <button 
                            onClick={handleCart}
                            className="border-1 px-4 py-2 rounded-lg bg-pink-700 cursor-pointer hover:bg-pink-800 transition"
                        >
                            <h1>Add to Cart ({quantity})</h1>
                        </button>
                    </div>

                    {/* Cart Count Badge (Optional) */}
                    {cart?.length > 0 && (
                        <div className="mt-2 text-sm">
                            Cart items: {cart.reduce((sum, item) => sum + item.quantity, 0)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PDetails