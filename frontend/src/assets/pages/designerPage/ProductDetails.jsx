import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { MdDelete} from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { TbCurrencyNaira } from "react-icons/tb";
import { IoHandLeft } from "react-icons/io5";
import { GoPlus} from "react-icons/go";
import { FiMinus } from "react-icons/fi";
import { FaArrowLeft } from "react-icons/fa";

const ProductDetails = () => {
    const [editPrice, setEditPrice] = useState(false)
    const [editDescription, setEditDescription] = useState(false)
    const [editCategory, setEditCategory] = useState(false)
    const [productDetails, setProductDetails] = useState({})
    const [productList, setProductList] = useState({})
    const {id} = useParams()
    const Navigate = useNavigate()


    const fetchProductDetail = async(id) => {
        
        try {
            let response = await fetch(`https://amani-design-backend.onrender.com/products/${id}`)
            let data = await response.json()
            setProductDetails(data)
        } catch(error) {
            console.log(error)
        }
        
    }

    useEffect(() => {
        fetchProductDetail(id)
    }, [id])

    const handleEditPrice = () => {
        setEditPrice(true)
        setEditDescription(false)
        setEditCategory(false)
    }

    const handleEditDescription = () => {
        setEditDescription(true)
        setEditCategory(false)
        setEditPrice(false)
    }

    const handleEditCategory = () => {
        setEditCategory(true)
         setEditPrice(false)
         setEditDescription(false)
    }

    if (!productDetails) {
    return <p className="text-gray-50">Loading product details...</p>;
  }

  const handleUpdate = async(productDetails, e) => {
    e.preventDefault()
    try {
        let response = await fetch (`https://amani-design-backend.onrender.com/products/${id}`, {
            "method" : "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(productDetails)
        })

        if(response.ok) {
            console.log(`${productDetails} submitted successfully`)
        }

    } catch(error){
        console.log(error)
    }
  }

  const handleDelete = async() => {
    try {
        let response = await fetch (`https://amani-design-backend.onrender.com/products/`, {
            "method": "GET",
        })
        let data = response.JSON
        setProductList(data)
        if (response.ok){
            try {
                let response = await fetch(`https://amani-design-backend.onrender.com/products/${id}`, {
                "method": "DELETE",
                })
                setProductList(prev => prev.filter(product => product.id !== id))

                if (response.ok) {
                    Navigate("/products")
                }
            }catch(error){
                console.log(error)
    }
        }
    }catch(error){
        console.log(error)
    }
  }

  const handleGoBack = () => Navigate("/products")

    return(
               <div className="w-full flex flex-col gap-10 pt-4">
               <div
                    className="w-full text-gray-50 px-4 text-2xl"
                    >
                        <button 
                        onClick={handleGoBack}
                        className="flex items-center gap-4 cursor-pointer">
                            <FaArrowLeft />
                            <h1>back</h1>
                        </button>
                </div>
                <div className="w-[90%] mx-auto min-h -screen flex flex-col text-gray-50 font-[abril] text-xl px-4 gap-4
                sm:text-2xl
                md:flex-row
                ">
                    <div
                    className="w-full
                    md:w-[50%] md:h-auto 
                    "
                    >
                        <img src={productDetails.productImage} className="w-full h-full rounded-lg "/>
                    </div>
                    <div
                    className="w-full flex flex-col gap-5 px-4
                    md:w-1/2  
                     "
                    >
                    <div className="w-full 
                    
                    ">
                        {editPrice 
                        ?
                        <form className="w-1/2 mx-auto flex justify-between gap-4 items-center bg-gray-50 border-1 rounded-lg text-gray-900
                        md:w-2/3
                        lg:w-1/2
                        ">
                            <FiMinus />
                            <input type="number" value={productDetails.productPrice} onChange={(e) => setProductDetails({...productDetails, [e.target.name]: e.currentTarget.value})} name="productPrice" className="w-[70%]   focus:outline-none"/>
                            <GoPlus/>
                        </form> 
                        :
                        <div className="w-full flex items-center justify-between gap-2 pt-2">
                            <h1 className="flex items-center font-semibold"><TbCurrencyNaira />{productDetails.productPrice}</h1>
                            <button onClick={handleEditPrice} className="cursor-pointer">
                                <CiEdit  className="font-normal"/>
                            </button>
                        </div>
                        }
                    </div>
                    <div>
                        {
                            editDescription 
                            ?
                            <form>
                                <textarea rows="10" cols="50" maxLength="150" name="productDescription" id="productDescription" value={productDetails.productDescription} onChange={(e) => setProductDetails({...productDetails, [e.target.name]: e.currentTarget.value})}  placeholder="Description ......"
                                className="w-full border-2 rounded-lg py-2 px-2 border-gray-700 focus:outline-none font-[abril]"
                                >
                                </textarea>
                            </form>
                            :
                            <div
                            className="w-full flex items-center justify-between gap-2 pt-2"
                            >
                                <h1>{productDetails.productDescription}</h1>
                                <button onClick={handleEditDescription} className="cursor-pointer">
                                    <CiEdit  className="font-normal"/>
                                </button>
                            </div>
                        }
                    </div>

                    <div>
                        {
                            editCategory
                            ?
                            <select id="productCategory" name="productCategory" value={productDetails.productCategory} onChange={(e) => setProductDetails({...productDetails, [e.target.name]: e.currentTarget.value})}
                            className="w-auto flex flex-col justify-center font-[abril] text-gray-500"
                            >
                                <option hidden>Product Category</option>
                                <option value="men clothing">Men's Clothing</option>
                                <option value="men footWear">Men's Footwear</option>
                                <option value="men handBag">Men's handBag/purse</option>  
                                <option value="men clothingAccessory">Men's Clothing Accessories</option> 
                                <option value="women clothing">Women's Clothing</option>
                                <option value="women footWear">Women's Footwear</option>
                                <option value="women handBag">Women's handBag/purse</option>  
                                <option value="women clothingAccessory">Women's Clothing Accessories</option>
                                <option value="kid clothing">Kid's Clothing</option>
                                <option value="kid footWear">Kid's Footwear</option>  
                                <option value="kid clothingAccessory">Kid's Clothing Accessories</option>              
                            </select>
                            :
                             <div 
                             className="w-full flex items-center justify-between  gap-2 pt-2"
                             >
                                <h1>{productDetails.productCategory}</h1>
                                <button onClick={handleEditCategory} className="cursor-pointer">
                                    <CiEdit  className="font-normal"/>
                                </button>
                             </div>
                        }
                    </div>
                    <div
                    className="w-full flex items-center justify-between my-6 "
                    >
                        <button type="button"
                        onClick={(e)=> handleUpdate(productDetails, e)}
                        className="w-auto border-1 border-gray-100 px-4 rounded-lg text-blue-300 cursor-pointer"
                        >
                            <h1>update</h1>
                        </button>
                        <button
                        onClick={handleDelete}
                        className="w-auto border-1 border-gray-100 px-4 rounded-lg text-red-500 cursor-pointer"
                        >
                            <h1>delete</h1>
                        </button>
                    </div>
                    </div>
        </div>
        </div>
    )
}

export default ProductDetails;