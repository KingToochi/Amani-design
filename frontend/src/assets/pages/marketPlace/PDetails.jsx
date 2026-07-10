import { useNavigate, useParams } from "react-router-dom"
import { useState, useEffect, useContext } from "react"
import { FiArrowLeft } from "react-icons/fi"
import { FaNairaSign } from "react-icons/fa6"
import { TbCurrencyNaira } from "react-icons/tb"
import { CartContext } from "../../hooks/CartContext"
import { BASE_URL } from "../../Url"

const PDetails = () => {
    const url = BASE_URL
    const {_id} = useParams()
    const navigate = useNavigate()
    const [productDetails, setProductDetails] = useState(null) // Start with null, not empty array
    const [cart, setCart] = useContext(CartContext);
    const [quantity, setQuantity] = useState(1)
    const [loading, setLoading] = useState(true)
    const [selectedSize, setSelectedSize] = useState(null)
    const [selectedColor, setSelectedColor] = useState(null)
    const [productPrice, setProductPrice] = useState(0)
    const [colors, setColors] = useState([])
    const [sizes, setSizes] = useState([])
    const [message, setMessage] = useState(null)

    const fetchProduct = async() => {
        try {
            let response = await fetch(`${url}/products/${_id}`)
            let data = await response.json()
            setProductDetails(data)
            setProductPrice(data.basePrice) // Set price from fetched data
            addColors(data) // Populate colors based on product data
            addSizes(data) // Populate sizes based on product data
            console.log('Fetched product details:', data)
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
        if (!selectedSize || !selectedColor) {
            setMessage("Please select size and color before adding to cart.")
            return;
        }

        let itemId;

        const isBaseProduct = selectedColor === productDetails.baseColor && selectedSize === productDetails.baseSize

        if (isBaseProduct) {
            itemId = productDetails._id

        }else {
            const selectedVariant = productDetails.variants?.find(variant => selectedColor === variant.color && selectedSize === variant.size)
            if (!selectedVariant){
                setMessage("Selected variant not available.");
                return;
    
            }
            itemId = selectedVariant._id
            
        }
       

        setCart(prevCart => {
            // Check if product exists in cart using _id
            const existing = prevCart.find(item => item.itemId === itemId)

            let updatedCart;
            if (existing) {
                // Update quantity if product exists
                updatedCart = prevCart.map(item =>
                    item.itemId === itemId
                    ? {...item, quantity: item.quantity + quantity}
                    : item
                )
                console.log(`Updated ${productDetails.productName} quantity to ${existing.quantity + quantity}`)
            } else {
                // Add new product with size and color
                updatedCart = [...prevCart, {
                    ...productDetails,
                    itemId,
                    quantity,
                    selectedSize,
                    selectedColor,
                    productPrice
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

    const addColors = (data) => {
        const variantColors = data.hasVariants
            ? data.variants.map(variant => variant.color)
            : [];

        setColors(prevColors => [
            ...new Set([
                ...prevColors,
                data.baseColor,
                ...variantColors
            ])
        ]);
    };

    const addSizes = (data) => {
        const variantSizes = data.hasVariants
            ? data.variants.map(variant => variant.size)
            : [];

        setSizes(prevSizes => [
            ...new Set([
                ...prevSizes,
                data.baseSize,
                ...variantSizes
            ])
        ]);
    };

    const handleSelectedSize = (size) => {
        setSelectedSize(size)
       

        const baseColor = (productDetails.baseSize === size) ? productDetails.baseColor : null
        const basePrice = (productDetails.baseSize === size) ? productDetails.basePrice : null

        const variantWithSelectedSize = productDetails.hasVariants ? productDetails.variants.filter(variant => variant.size === size) : []

        if (variantWithSelectedSize.length > 0) {
            const colorsForSize = variantWithSelectedSize.map(variant => variant.color)
            setProductPrice(basePrice ?? variantWithSelectedSize[0].price)
            setColors([
                ...new Set([
                    ...(baseColor ? [baseColor] : []),
                    ...colorsForSize
                ])
            ])

        }else {
            setProductPrice(productDetails.basePrice)
            addColors(productDetails) // Reset colors to all available options
        }

    }

   const handleSelectedColor = (color) => {
    setMessage("");

    // Base product
    if (
        color === productDetails.baseColor &&
        (
            selectedSize === productDetails.baseSize ||
            !selectedSize
        )
    ) {
        setSelectedColor(color);
        setProductPrice(productDetails.basePrice);
        return;
    }

    const variant = productDetails.hasVariants
        ? productDetails.variants.find(
              variant =>
                  variant.color === color &&
                  variant.size === selectedSize
          )
        : null;

    if (!variant) {
        setMessage(
            `${color} is not available for the selected size.`
        );
        return;
    }

    setSelectedColor(color);
    setProductPrice(variant.price);
};

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
                <img src={productDetails?.productImages[0]}
                className="rounded-lg
                 md:w-[50%] md:max-h-screen object-cover
                "
                alt={productDetails?.productName}
                />
                <div
                className="mt-4 flex flex-col px-6 gap-4
                md:w-1/2 
                "
                >
                    <h1 className="flex items-center gap-2">
                        <TbCurrencyNaira /> {productPrice}
                    </h1>
                    <h1 className="text-semibold text-sm text-gray-700">{productDetails.productCategory}</h1>
                    <p className="text-gray-400 text-sm">{productDetails.productDescription}</p>
                    
                    {/* Size Selection */}
                    <div>
                        <h1 className="mb-2">Size:</h1>
                        <div className="flex gap-2">
                            {sizes.map(size => (
                                <button
                                    key={size}
                                    onClick={() => handleSelectedSize(size)}
                                    className={`px-3 py-1 border rounded ${
                                        selectedSize === size 
                                        ? 'bg-black text-white' 
                                        : 'hover:bg-gray-100'
                                    }`}
                                >
                                    {size}
                                </button>
                            ))}
                            <h2 className="text-sm text-red-500">{message}</h2>
                        </div>
                    </div>

                    {/* Color Selection */}
                    <div>
                        <h1 className="mb-2">Color:</h1>
                        <div className="flex gap-2">
                            {colors.map(color => (
                                <button
                                    key={color}
                                    onClick={() => handleSelectedColor(color)}
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
                        onClick={() => {
                            handleCart();
                            navigate('/checkout');
                        }}
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
            <div className="w-full mt-6">
                    {productDetails.productImages.length > 1 && (
                        <div className="w-full grid grid-cols-4 gap-2">
                            {productDetails?.productImages?.map((image, index) => (
                            <img 
                            key={index} 
                            src={image} 
                            alt={`Product ${index + 1}`}
                            className="w-full h-auto object-cover rounded-lg"
                        />
                        ))}
                        </div>
                    )}
                </div>
        </div>
    )
}

export default PDetails