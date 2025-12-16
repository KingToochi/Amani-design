import { FaNairaSign } from "react-icons/fa6";
import { useState, useContext} from "react";
import { BASE_URL } from "../../Url";
import { AuthContext } from "../marketPlace/hooks/AuthProvider";
const AddProduct = ({setHideModal, fetchProduct}) => {
    const [fileName, setFileName] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const url = BASE_URL
    const {auth} = useContext(AuthContext)
    const handleChange =(e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file)
        }
        else {
            setFileName("")
        }
    }

const handleSubmit = async(event) => {
    event.preventDefault()
    setIsSubmitting(true)
    const form = event.currentTarget
    const formData = new FormData(form)
    let hasError = false

    // validate form
    for (let [key, value] of formData.entries()) {
        if (!value || (value instanceof File && value.size === 0)) {
            console.log(`${key} is required`)
            hasError = true
            setIsSubmitting(false)
            break
    } 
}
    if (hasError) return 

    if (!hasError) {
        const token = localStorage.getItem("token"); 
        try {
            let uploadData = await fetch(`${url}/products`, {
                method  : "POST",
                headers : {Authorization : `Bearer ${token}` },
                body : formData
            })
            let response = await uploadData.json()
            console.log(response.message)
            if (response.message === "Product created successfully") {
                setIsSubmitting(false)
                fetchProduct()
                setHideModal(false)

            }
        }catch(error){
            console.log(error)
        }
    }

}
    

    return(
        <form onSubmit={handleSubmit}
        className="w-full h-auto flex flex-col px-2 justify-center gap-6"
        >
            <div
            className="w-full flex flex-col items-center"
            >
                <label htmlFor="productImage"
                className="w-auto px-2 py-2 border-2 border-gray-700 rounded-lg cursor-pointer text-2xl font-[abril] font-semibold"
                >
                    {fileName ? fileName.name : "Add your product image"}
                </label>
                <input id="productImage" name="productImage" type="file" accept="image/*" capture="" className="hidden" onChange={handleChange}/>
            </div>
            <textarea rows="10" cols="50" maxLength="150" name="productDescription" id="productDescription" placeholder="Description ......"
            className="w-full border-2 rounded-lg py-2 px-2 border-gray-700 focus:outline-none font-[abril] text-xl "
            ></textarea>
            <select id="productCategory" name="productCategory"
            className="w-auto flex flex-col justify-center font-[abril]"
            >
                <option value=""  hidden>Product Category</option>
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
            <div
            className="w-full flex items-center gap-2"
            >
                <input type="text" name="color" placeholder="color" 
                className="w-1/2 px-1"
                />
                <select id="size" name="size" className="w-1/2 flex flex-col justify-center items-center px-2">
                    <option value="" hidden>select size</option>
                    <option value="xs">XS</option>
                    <option value="s">S</option>
                    <option value="m">M</option>
                    <option value="l">L</option>
                    <option value="xl">XL</option>
                    <option value="xxl">XXl</option>
                </select>
            </div>
            <div
            className="flex w-full items-center justify-center gap-2 sm:text-xl font-[abril]"
            >
                <label htmlFor="productPrice" className="font-[abril]">Price:</label>
                <div
                className="flex border-2 border-gray-700 rounded-lg w-auto px-2 py-2 items-center gap-2"
                >
                    <FaNairaSign />
                    <input type="number" name="productPrice" id="productPrice" 
                    className="focus:outline-none"
                    />
                </div>
            </div>
            <div
            className="w-full flex items-center justify-center"
            >
                <button
                disabled={isSubmitting}
                className="w-auto border-2 border-gray-700 rounded-lg px-2 py-2 bg-blue-400 cursor-pointer"
                >
                    <h1
                    className="text-gray-500 font-[abril] font-bold text-2xl"
                    >{isSubmitting ? "submitting ..." : "Submit"}</h1>
                </button>
            </div>
        </form>
    )
}

export default AddProduct;
