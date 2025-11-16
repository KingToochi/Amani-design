import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { MdDelete} from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { TbCurrencyNaira } from "react-icons/tb";
import { IoHandLeft } from "react-icons/io5";
import { GoPlus} from "react-icons/go";
import { FiMinus } from "react-icons/fi";

const ProductDetails = () => {
    const [editProduct, setEditProduct] = useState(false)
    const [productDetails, setProductDetails] = useState({})
    const {id} = useParams()
    

    const fetchProductDetail = async(id) => {
        try {
            let response = await fetch(`http://localhost:3000/products/${id}`)
            let data = await response.json()
            setProductDetails(data)
        } catch(error) {
            console.log(error)
        }
        
    }

    useEffect(() => {
        fetchProductDetail(id)
    }, [id])

    const handleEditProduct = (form) => {
        setEditProduct(true)
    }

    if (!productDetails) {
    return <p className="text-gray-50">Loading product details...</p>;
  }

    return(
                <div className="w-full min-h -screen flex flex-col text-gray-50 font-[abril] text-lg px-4 ">
                    <div
                    className="w-full pt-2"
                    >
                        <img src={productDetails.productImage} className="w-full h-full rounded-lg "/>
                    </div>
                    <div className="w-2/4 my-2">
                        {editProduct 
                        ?
                        <form className="flex gap-2 items-center bg-gray-50 border-1 rounded-lg text-gray-900">
                            <FiMinus />
                            <input type="number" name="productPrice" className="w-[70%]  focus:outline-none"/>
                            <GoPlus/>
                        </form> 
                        :
                        <div className="w-full flex items-center justify-between gap-2 pt-2">
                            <h1 className="flex items-center font-semibold"><TbCurrencyNaira />{productDetails.productPrice}</h1>
                            <button onClick={handleEditProduct}>
                                <CiEdit  className="font-normal"/>
                            </button>
                        </div>
                        }
                    </div>
                    <h1>{productDetails.productDescription}</h1>
                    <h1>{productDetails.productCategory}</h1>
        </div>
    )
}

export default ProductDetails;