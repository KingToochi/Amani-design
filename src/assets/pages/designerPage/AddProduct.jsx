import { FaNairaSign } from "react-icons/fa6";
import { useState } from "react";
const AddProduct = () => {
    const [fileName, setFileName] = useState("")
    // const [formData, setFormData] = useState({})
    const submitProduct = async(productData) => {
        try {
            let response = await fetch("http://localhost:3000/products", {
                method : "post",
                body:JSON.stringify( productData),

            })
            if(!response.ok) throw new Error("unable to post")
            
        } catch (error) {
            console.log(error)
        }
    }
    const handleChange =(e) => {
        const file = e.target.files[0];
        if (file) {
            setFileName(file)
            // const reader = new FileReader();
            // reader.onloadend = () => {
            //     const base64String = reader.result;
            //     setFormData((prev) => ({
            //         ...prev,
            //         image: base64String,
            //     }));
            // }
            // reader.readAsDataURL(file)
        }
        else {
            setFileName("")
        }
    }
    const handleSubmit = (event) => {
        event.preventDefault()
        const formData = new FormData(event.target)
        const productData = Object.fromEntries(formData.entries())
        // const finalProductData = {
        //     ...productData, 
        //     image: formData.image,
        // }
        submitProduct(productData)
        event.target.reset()
        setFileName("")
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
                className="w-auto border-2 border-gray-700 rounded-lg px-2 py-2 bg-blue-400 cursor-pointer"
                >
                    <h1
                    className="text-gray-500 font-[abril] font-bold text-2xl"
                    >Submit</h1>
                </button>
            </div>
        </form>
    )
}

export default AddProduct;
