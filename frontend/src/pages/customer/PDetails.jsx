import { useNavigate, useParams } from "react-router-dom"
import { useState, useEffect, useContext } from "react"
import { FiArrowLeft } from "react-icons/fi"
import { FaNairaSign } from "react-icons/fa6"
import { FaStar } from "react-icons/fa"
import { TbCurrencyNaira } from "react-icons/tb"
import { CartContext } from "../../context/CartContext"
import { AuthContext } from "../../context/AuthContext"
import { BASE_URL } from "../../Url"
import CustomFetch from "../../hooks/useFetch"
import Popup from "../../components/common/Popup"

const PDetails = () => {
    const url = BASE_URL
    const {_id} = useParams()
    const navigate = useNavigate()
    const [productDetails, setProductDetails] = useState(null) // Start with null, not empty array
    const [cart, setCart] = useContext(CartContext);
    const { auth, isLoggedIn } = useContext(AuthContext)
    const [quantity, setQuantity] = useState(1)
    const [loading, setLoading] = useState(true)
    const [selectedSize, setSelectedSize] = useState(null)
    const [selectedColor, setSelectedColor] = useState(null)
    const [productPrice, setProductPrice] = useState(0)
    const [colors, setColors] = useState([])
    const [sizes, setSizes] = useState([])
    const [message, setMessage] = useState(null)
    const [popupMessage, setPopupMessage] = useState("")
    const [reviewData, setReviewData] = useState({ reviews: [], averageRating: 0, totalRatings: 0 })
    const [reviewContent, setReviewContent] = useState("")
    const [reviewRating, setReviewRating] = useState(0)
    const [reviewSubmitting, setReviewSubmitting] = useState(false)
    const [reviewError, setReviewError] = useState("")

    console.log(isLoggedIn, auth)
    

    useEffect(() => {
        if (!popupMessage) return undefined

        const timeoutId = setTimeout(() => {
            setPopupMessage("")
        }, 2500)

        return () => clearTimeout(timeoutId)
    }, [popupMessage])

    const fetchProduct = async() => {
        try {
            let response = await fetch(`${url}/products/${_id}`)
            let data = await response.json()
            console.log(data)
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

    const fetchReviews = async () => {
        try {
            const response = await fetch(`${url}/reviews/products/${_id}`)
            const data = await response.json()
            if (response.ok) {
                setReviewData(data)
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        fetchReviews()
    }, [_id])

    const handleSubmitReview = async (event) => {
        event.preventDefault()
        
        if(reviewRating === 0 || reviewRating === "0") return

        setReviewSubmitting(true)
        setReviewError("")


        try {
            const response = await CustomFetch(`${url}/reviews/products/${_id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: reviewContent, rating: reviewRating || null })
            })
            const data = await response?.json()

            if (!response?.ok) {
                throw new Error(data?.message || "Unable to save your review")
            }

            setReviewData(data)
            setReviewContent("")
            setReviewRating(0)
            setPopupMessage("Review submitted successfully")
        } catch (error) {
            setReviewError(error.message || "Unable to save your review")
        } finally {
            setReviewSubmitting(false)
        }
    }

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
        setPopupMessage("Item added to cart")
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
        <>
        <Popup
            message={popupMessage}
            onClose={() => setPopupMessage("")}
        />
        <div className="flex flex-col gap-4 pt-2 px-2 w-full min-h-screen text-gray-500 text-lg font-[abril] 
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
                            if (!productDetails) return;
                            if (!selectedSize || !selectedColor) {
                                setMessage("Please select size and color before buying.");
                                return;
                            }

                            const addAndGoToCheckout = () => {
                                handleCart();
                                navigate('/checkout');
                            };

                            addAndGoToCheckout();
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

          <section className="w-full mt-8 rounded-xl border border-gray-200 bg-white p-5 text-gray-800 shadow-sm mb-[75px] md:mb-[80px]">
                    <div className="flex flex-col gap-3 border-b border-gray-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="text-xl font-semibold">Reviews and ratings</h2>
                            <p className="text-sm text-gray-500">{reviewData.totalReviews || 0} reviews from customers</p>
                        </div>
                        <div className="flex items-center gap-2 text-amber-500">
                            <FaStar />
                            <span className="font-semibold text-gray-800">{Number(reviewData.averageRating || 0).toFixed(1)}</span>
                            <span className="text-sm text-gray-500">({reviewData.totalRatings || 0} ratings)</span>
                        </div>
                    </div>

                    {isLoggedIn ? (
                        <form onSubmit={handleSubmitReview} className="mt-5 rounded-lg bg-gray-50 p-4">
                            <h3 className="font-medium">Share your experience</h3>
                            <div className="mt-3 flex items-center gap-1" aria-label="Select a rating">
                                {[1, 2, 3, 4, 5].map(value => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setReviewRating(value)}
                                        aria-label={`${value} star${value > 1 ? "s" : ""}`}
                                        className={value <= reviewRating ? "text-amber-500" : "text-gray-300"}
                                    >
                                        <FaStar />
                                    </button>
                                ))}
                            </div>
                            <textarea
                                value={reviewContent}
                                onChange={event => setReviewContent(event.target.value)}
                                placeholder="Write a review"
                                rows="3"
                                className="mt-3 w-full rounded-lg border border-gray-200 bg-white p-3 text-sm outline-none focus:border-gray-700"
                            />
                            {reviewError && <p className="mt-2 text-sm text-red-600">{reviewError}</p>}
                            <button type="submit" disabled={reviewSubmitting || (!reviewContent.trim() && !reviewRating)} className="mt-3 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white disabled:opacity-50">
                                {reviewSubmitting ? "Submitting..." : "Submit review"}
                            </button>
                        </form>
                    ) : (
                        <p className="mt-5 text-sm text-gray-500">Sign in to leave a review or rating.</p>
                    )}

                    <div className="mt-6 space-y-4">
                        {reviewData.reviews?.length ? reviewData.reviews.map(review => (
                            <article key={review._id} className="border-b border-gray-100 pb-4 last:border-0">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="font-medium">{review.userId?.fname || review.userId?.username || "Customer"}</p>
                                    {review.rating && <div className="flex items-center gap-1 text-sm text-amber-500"><FaStar /> {review.rating}/5</div>}
                                </div>
                                {review.content && <p className="mt-2 text-sm leading-6 text-gray-600">{review.content}</p>}
                            </article>
                        )) : <p className="mt-6 text-sm text-gray-500">No reviews yet.</p>}
                    </div>
                </section>
        </>
    )
}

export default PDetails