import { FaNairaSign } from "react-icons/fa6";
import { useState, useContext} from "react";
import { BASE_URL } from "../../Url";
import { AuthContext } from "../marketPlace/hooks/AuthProvider";
const AddProduct = ({setHideModal, productList, fetchProduct, imageLimit}) => {
    const [fileName, setFileName] = useState()
    const [serverError, setServerError] = useState(null)
    const [images, setImages] = useState([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [imageSources, setImageSources] = useState()
    const [showVariant, setShowVariant] = useState(false)
    const [numberOfVariants, setNumberOfVariants] = useState(0)
    const [formField, setFormField] = useState([
        {element: "input", name : "productName", id: "productName", type: "text", value:"", placeholder:"name of your product", label: "Product Name"},
        {element: "select", id:"productCategory", name:"productCategory", type:"text", label: "Product Category", option:["clothing", "footwear", "handbag", "accessory"]},
        {element: "select", id:"productSubCategory", name:"productSubCategory", type:"text", label: "Sub-Category", option:["men clothing", "men footwear","men handbag", "men clothingaccessory", "women clothing", "women footWear", "women handbag", "women clothingaccessory", "kid clothing", "kid footWear", "kid clothing accessory"]},
        {element: "input", type:"file", id:"productImage", name:"productImage", accept:"image/*", value:"", label:"Image Product"},
        {element: "textarea", name:"productDescription", type:"text", id:"productDescription", placeholder:"Description ......", label: "Product Description"},
        {element: "select", id:"size", name:"size", type:"text", label: "Size", option:["xs", "s", "m", "l", "xl", "xxl"]},
        {element: "input", type:"text", id:"color", name:"color", placeholder:" add product color", label: "Color"},
        {element: "input", type:"number", id:"Price", name:"productPrice", placeholder:"Price", label:"Price"},
    ])
    const url = BASE_URL
    const {auth} = useContext(AuthContext)
    const subscriber = auth.subscriber
    const plan = auth.subscriptionPlan
    const status = auth.subscriptionStatus
    const isExpired = new Date(auth.subscriptionExpiryDate).getTime() < new Date().getTime()
    
    const addToFormField = () => {
        if (showVariant) {
            formField.push(
                {element: "select", id:"VariantSize", name:"size", type:"text", label: "Size", option:["xs", "s", "m", "l", "xl", "xxl"]},
                {element: "input", type:"text", id:"VariantColor", name:"color", placeholder:" add product color", label: "Color"},
                {element: "input", type:"number", id:"VaraintPrice", name:"productPrice", placeholder:"Price", label:"Price"},
            )
        }
    }

    const displayVariantOptions = (e) => {
        e.preventDefault()
        setShowVariant(true)
        // if (plan === "standard") {
        //     setNumberOfVariants(3)
        // } else if (plan === "premium") {
        //     setNumberOfVariants(10)
        // }
    }

//     const handleChange =(e) => {
//         const file = e.target.files[0];
//         if (file) {
//             setFileName(file)
//         }
//         else {
//             setFileName("")
//         }
//     }

// const handleSubmit = async(event) => {
//     event.preventDefault()
//     setIsSubmitting(true)
//     const form = event.currentTarget
//     const formData = new FormData(form)
//     let hasError = false

//     // validate form
//     for (let [key, value] of formData.entries()) {
//         if (!value || (value instanceof File && value.size === 0)) {
//             console.log(`${key} is required`)
//             hasError = true
//             setIsSubmitting(false)
//             break
//     } 
// }
//     if (hasError) return 

//     if (!hasError) {
//         const token = localStorage.getItem("token"); 
//         try {
//             let uploadData = await fetch(`${url}/products`, {
//                 method  : "POST",
//                 headers : {Authorization : `Bearer ${token}` },
//                 body : formData
//             })
//             let response = await uploadData.json()
//             console.log(response.message)
//             if (response.message === "Product created successfully") {
//                 setIsSubmitting(false)
//                 // fetchProduct()
//                 setHideModal(false)

//             }
//         }catch(error){
//             console.log(error)
//         }
//     }

// }



    

    // return(
    //     <form onSubmit={handleSubmit}
    //     className="w-full h-auto flex flex-col px-2 justify-center gap-6"
    //     >
    //         <div
    //         className="w-full flex flex-col items-center"
    //         >
    //             <label htmlFor="productImage"
    //             className="w-auto px-2 py-2 border-2 border-gray-700 rounded-lg cursor-pointer text-2xl font-[abril] font-semibold"
    //             >
    //                 {fileName ? fileName.name : "Add your product image"}
    //             </label>
    //             <input id="productImage" name="productImage" type="file" accept="image/*" capture="" className="hidden" onChange={handleChange}/>
    //         </div>
    //         <textarea rows="10" cols="50" maxLength="150" name="productDescription" id="productDescription" placeholder="Description ......"
    //         className="w-full border-2 rounded-lg py-2 px-2 border-gray-700 focus:outline-none font-[abril] text-xl "
    //         ></textarea>
    //         <input type="text" id="productName" name="productName" placeholder="name of your design"/>
    //         <select id="productCategory" name="productCategory"
    //         className="w-auto flex flex-col justify-center font-[abril]"
    //         >
    //             <option value=""  hidden>Category</option>
    //             <option value="men clothing">Men's Clothing</option>
    //             <option value="men footWear">Men's Footwear</option>
    //             <option value="men handBag">Men's handBag/purse</option>  
    //             <option value="men clothingAccessory">Men's Clothing Accessories</option> 
    //             <option value="women clothing">Women's Clothing</option>
    //             <option value="women footWear">Women's Footwear</option>
    //             <option value="women handBag">Women's handBag/purse</option>  
    //             <option value="women clothingAccessory">Women's Clothing Accessories</option>
    //             <option value="kid clothing">Kid's Clothing</option>
    //             <option value="kid footWear">Kid's Footwear</option>  
    //             <option value="kid clothingAccessory">Kid's Clothing Accessories</option>              
    //         </select>
    //         <div
    //         className="w-full flex items-center gap-2"
    //         >
    //             <input type="text" name="color" placeholder="color" 
    //             className="w-1/2 px-1"
    //             />
    //             <select id="size" name="size" className="w-1/2 flex flex-col justify-center items-center px-2">
    //                 <option value="" hidden>select size</option>
    //                 <option value="xs">XS</option>
    //                 <option value="s">S</option>
    //                 <option value="m">M</option>
    //                 <option value="l">L</option>
    //                 <option value="xl">XL</option>
    //                 <option value="xxl">XXl</option>
    //             </select>
    //         </div>
    //         <div
    //         className="flex w-full items-center justify-center gap-2 sm:text-xl font-[abril]"
    //         >
    //             <label htmlFor="productPrice" className="font-[abril]">Price:</label>
    //             <div
    //             className="flex border-2 border-gray-700 rounded-lg w-auto px-2 py-2 items-center gap-2"
    //             >
    //                 <FaNairaSign />
    //                 <input type="number" name="productPrice" id="productPrice" 
    //                 className="focus:outline-none"
    //                 />
    //             </div>
    //         </div>
    //         <div
    //         className="w-full flex items-center justify-center"
    //         >
    //             <button
    //             disabled={isSubmitting}
    //             className="w-auto border-2 border-gray-700 rounded-lg px-2 py-2 bg-blue-400 cursor-pointer"
    //             >
    //                 <h1
    //                 className="text-gray-500 font-[abril] font-bold text-2xl"
    //                 >{isSubmitting ? "submitting ..." : "Submit"}</h1>
    //             </button>
    //         </div>
    //     </form>
    // )


    // return (
    //     <div className="w-full h-auto flex flex-col px-2 justify-center gap-6">
    //         <form>
    //             {/* Form fields go here */}
    //             <div>
    //                 <label htmlFor="productName">Product Name:</label>
    //                 <input type="text" id="productName" name="productName" placeholder="name of your product"/>
    //             </div>
                
    //             <div>
    //                 <label htmlFor="productImage">{(images.length === 0 ? "Add product Images" : `${images.length} image(s) selected`)}</label>
    //                 {imageSources === "files"
    //                  ? 
    //                  <input type="file" id="productImage" name="productImage" accept="image/*" multiple capture="" />
    //                  :
    //                  <input type="file" id="productImage" name="productImage" accept="image/*" multiple capture="environment" />
    //                 }
    //             </div>

    //             <div>
    //                 <textarea rows="10" cols="50" maxLength="150" name="productDescription" id="productDescription" placeholder="Description ......"
    //                 className="w-full border-2 rounded-lg py-2 px-2 border-gray-700 focus:outline-none font-[abril] text-xl "
    //                 ></textarea>
    //             </div>
    //             <div>
    //                 <label htmlFor="productName">Product Name:</label>
    //                 <input type="text" id="productName" name="productName" placeholder="name of your product"/>
    //             </div>
    //             <div>
    //                 <label htmlFor="productCategory">Category:</label>
    //                 <select id="productCategory" name="productCategory"
    //                 className="w-auto flex flex-col justify-center font-[abril]"
    //                 >
    //                     <option value=""  hidden>Category</option>
    //                     <option value="clothing">Clothing</option>
    //                     <option value="footWear">Footwear</option>
    //                     <option value="handBag">handBag/purse</option>  
    //                     <option value="accessory">Accessories</option> 
    //                 </select>
    //             </div>

    //             <div>
    //                 <label htmlFor="productSubCategory">Sub-Category:</label>
    //                 <select id="productSubCategory" name="productSubCategory"
    //                 className="w-auto flex flex-col justify-center font-[abril]"
    //                 >
    //                     <option value=""  hidden>Sub-Category</option>
    //                     <option value="men clothing">Men's Clothing</option>
    //                     <option >Men's Footwear</option>
    //                     <option value="men handBag">Men's handBag/purse</option>  
    //                     <option value="men clothingAccessory">Men's Clothing Accessories</option> 
    //                     <option value="women clothing">Women's Clothing</option>
    //                     <option value="women footWear">Women's Footwear</option>
    //                     <option value="women handBag">Women's handBag/purse</option>  
    //                     <option value="women clothingAccessory">Women's Clothing Accessories</option>
    //                     <option value="kid clothing">Kid's Clothing</option>
    //                     <option value="kid footWear">Kid's Footwear</option>  
    //                     <option value="kid clothingAccessory">Kid's Clothing Accessories</option>
    //                 </select>
    //             </div>

    //             <div>
    //                 <label htmlFor="designerName">Brand/Desginer Name:</label>
    //                 <input type="text" id="designerName" name="designerName" placeholder="name of your brand/designer"/>
    //             </div>

    //             <div>
    //                 <label htmlFor="size">Size:</label>
    //                 <select id="size" name="size" className="w-1/2 flex flex-col justify-center items-center px-2">
    //                     <option value="" hidden>select size</option>
    //                     <option value="xs">XS</option>
    //                     <option value="s">S</option>
    //                     <option value="m">M</option>
    //                     <option value="l">L</option>
    //                     <option value="xl">XL</option>
    //                 </select>
    //             </div>

    //             <div>
    //                 <label htmlFor="color">Color:</label>
    //                 <input type="text" id="color" name="color" placeholder="color"/>
    //             </div>

    //             <div>
    //                 <FaNairaSign />
    //                     <input type="number" id="productPrice" name="productPrice" placeholder="Price"/>
    //             </div>
                
    //             {showVariant && ({

    //             })}

                
    //             <div>
    //                 {(plan === "standard" || plan === "premium") && (
    //                 <button onClick={displayVariantOptions}>Add size/color option</button>
    //             )}
    //                 <button type="submit">Submit</button>
    //             </div>
    //         </form>
    //     </div>
    // )

    return (
    <div>
        <h1>Add a Product</h1>

        <form>
        {formField.map((field, index) => {
        
            if (field.element === "input" && field.type === "file") {
            return (
                <div key={index}>
                    <label htmlFor={field.id}>{field.label}</label>

                    <button type="button">Upload a File</button>

                {imageSources === "file" ? (
                <input
                  type="file"
                  id={field.id}
                  name={field.name}
                  accept="image/*"
                  multiple
                />
              ) : (
                <input
                  type="file"
                  id={field.id}
                  name={field.name}
                  accept="image/*"
                  multiple
                  capture="environment"
                />
              )}
            </div>
          );
        }

        else if (field.element === "select") {
          return (
            <div key={index}>
              <label htmlFor={field.id}>{field.label}</label>

              <select id={field.id} name={field.name}>
                <option value="" hidden>
                  Please Select
                </option>

                {field.option.map((option, i) => (
                  <option key={i} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          );
        }

        else if (field.element === "textarea") {
          return (
            <div key={index}>
              <label htmlFor={field.id}>{field.label}</label>

              <textarea
                rows="10"
                cols="50"
                maxLength="150"
                name={field.name}
                id={field.id}
                placeholder={field.placeholder}
              />
            </div>
          );
        }

        else {
          return (
            <div key={index}>
              <label htmlFor={field.id}>{field.label}</label>

              <input
                type={field.type}
                id={field.id}
                name={field.name}
                placeholder={field.placeholder}
              />
            </div>
          );
        }

      })}
      {addToFormField()}
      <div>
        <button onClick={displayVariantOptions}>Add Variant Option</button>
        <button>Submit</button>
      </div>
    </form>
  </div>
    );
}

export default AddProduct;
