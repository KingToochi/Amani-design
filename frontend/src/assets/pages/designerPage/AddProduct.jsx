import { useState } from "react";
const AddProduct = ({setHideModal, productList, fetchProduct, imageLimits}) => {
    const [fileName, setFileName] = useState("")
    const [numberOfVariants, setNumberOfVariants] = useState(0)
    const [exceedVariantOption, setExceedVariantOption] = useState(false)
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
    const addToFormField = () => {
          const imageLimit = imageLimits
          const limits = imageLimit.maxProducts
          if (numberOfVariants >= limits) {
            setExceedVariantOption(true)
            return
          }
          console.log(limits)
          console.log(imageLimit)
          const newCount = numberOfVariants + 1;
          setNumberOfVariants(newCount)
          const variantSizeId = "VariantSize" + newCount
          const variantColorId = "VariantColor" + newCount
          const variantPriceId = "VariantPrice" + newCount

          setFormField((prev) => [...prev,
              {element: "select", id:variantSizeId, name:`size${newCount}`, type:"text", label: `Variant${newCount} size`, option:["xs", "s", "m", "l", "xl", "xxl"]},
              {element: "input", type:"text", id:variantColorId, name:`color${newCount}`, placeholder:" add product color", label: `variant${newCount} color`},
              {element: "input", type:"number", id:variantPriceId, name:`price${newCount}`, placeholder:"Price", label:`Variant${newCount} price`},
          ])
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

    const handleFileInputChange = (event) => {
        const file = event.target.files[0]
        setFileName(file?.name || "")
    }

    return (
    <div className="max-w-3xl mx-auto p-8 bg-white rounded-[32px] shadow-[0_20px_80px_rgba(15,23,42,0.08)] border border-gray-200">
        <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-8">Add a Product</h1>

        <form className="space-y-6">
        {formField.map((field, index) => {
        
            if (field.element === "input" && field.type === "file") {
            return (
                <div key={index} className="space-y-3">
                    <label htmlFor={field.id} className="block text-sm font-medium text-slate-700">{field.label}</label>

                    <input
                      type="file"
                      id={field.id}
                      name={field.name}
                      accept="image/*"
                      multiple
                      onChange={handleFileInputChange}
                      className="w-full rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:text-white file:font-semibold hover:file:bg-slate-800"
                    />

                    <p className="text-sm text-slate-500">{fileName ? `Selected: ${fileName}` : "Choose an image to upload"}</p>
                </div>
              );
            }

        else if (field.element === "select") {
          return (
            <div key={index} className="space-y-2">
              <label htmlFor={field.id} className="block text-sm font-medium text-slate-700">{field.label}</label>

              <select id={field.id} name={field.name} className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                <option value="" hidden>
                  Please Select
                </option>

                {field.option.map((option, i) => (
                  <option key={i} value={option} className="text-slate-800">
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          );
        }

        else if (field.element === "textarea") {
          return (
            <div key={index} className="space-y-2">
              <label htmlFor={field.id} className="block text-sm font-medium text-slate-700">{field.label}</label>

              <textarea
                rows="7"
                maxLength="150"
                name={field.name}
                id={field.id}
                placeholder={field.placeholder}
                className="w-full resize-none rounded-3xl border border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          );
        }

        else {
          return (
            <div key={index} className="space-y-2">
              <label htmlFor={field.id} className="block text-sm font-medium text-slate-700">{field.label}</label>

              <input
                type={field.type}
                id={field.id}
                name={field.name}
                placeholder={field.placeholder}
                className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          );
        }

      })}
      {exceedVariantOption ? 
      <div className="space-y-4">
        <p className="text-sm text-red-600">You have reached the maximum number of variant options.</p>
        <button type="submit" className="w-full rounded-3xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 sm:w-auto">Submit</button>
      </div>
       :
      <div className="grid gap-3 sm:flex sm:justify-end sm:items-center">
        <button onClick={addToFormField} type="button" className="w-full rounded-3xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 sm:w-auto">Add Variant Option</button>
        <button type="submit" className="w-full rounded-3xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 sm:w-auto">Submit</button>
      </div>
      }
    </form>
  </div>
    );
}

export default AddProduct;
