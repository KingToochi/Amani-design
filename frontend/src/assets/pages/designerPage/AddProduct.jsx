import { useState } from "react";
import { BASE_URL } from "../../Url";
import CustomFetch from "../../hooks/UseFetch";

const AddProduct = ({ setHideModal, productList, fetchProduct, imageLimits }) => {
    const [fileName, setFileName] = useState("");
    const [numberOfVariants, setNumberOfVariants] = useState(0);
    const [exceedVariantOption, setExceedVariantOption] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [file, setFile] = useState([]);
    const [error, setError] = useState({});
    const imageLimit = imageLimits;
    const [showVariant, setShowVariant] = useState(false);
    const [variant, setVariant] = useState([]);
    
    const [formField, setFormField] = useState([
        { element: "input", name: "productName", id: "productName", type: "text", value: "", placeholder: "name of your product", label: "Product Name" },
        { element: "select", id: "productCategory", name: "productCategory", type: "text", value: "", label: "Product Category", option: ["clothing", "footwear", "handbag", "accessory"] },
        { element: "select", id: "productSubCategory", name: "productSubCategory", type: "text", value: "", label: "Sub-Category", option: ["men clothing", "men footwear", "men handbag", "men clothing accessory", "women clothing", "women footWear", "women handbag", "women clothing accessory", "kid clothing", "kid footWear", "kid clothing accessory"] },
        { element: "input", type: "file", id: "productImage", name: "productImage", accept: "image/*", value: [], label: "Image Product" },
        { element: "textarea", name: "productDescription", type: "text", id: "productDescription", placeholder: "Description ......", value: "", label: "Product Description" },
        { element: "select", id: "size", name: "size", type: "text", label: "Size", value: "", option: {
            clothing: ["xs", "s", "m", "l", "xl", "xxl"],
            footwear: ["10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", 
                "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", 
                "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "53", 
                "54", "55", "56", "57", "58", "59", "60"],
            handbag: ["small", "medium", "large"],
            accessory: ["extra small", "small", "medium", "large", "one size", "adjustable"]
        } },
        { element: "input", type: "text", id: "color", name: "color", placeholder: "add product color", value: "", label: "Color" },
        { element: "input", type: "number", id: "productPrice", value: "", name: "productPrice", placeholder: "Price", label: "Price" },
    ]);
    

    
    const url = `${BASE_URL}/products`;


    const addToFormField = () => {
        const limits = imageLimit.maxProducts;
        if (numberOfVariants >= limits) {
            setExceedVariantOption(true);
            setShowVariant(false);
            return;
        }
        setShowVariant(true);
        const newCount = numberOfVariants + 1;
        setNumberOfVariants(newCount);
        
        const variantSizeId = "VariantSize" + newCount;
        const variantColorId = "VariantColor" + newCount;
        const variantPriceId = "VariantPrice" + newCount;

        setVariant(prev => [
            ...prev,
            [
                {
                    element: "select",
                    id: variantSizeId,
                    name: `size${newCount}`,
                    label: `Variant ${newCount} size`,
                    value: "",
                    option: {
                        clothing: ["xs", "s", "m", "l", "xl", "xxl"],
                        footwear: ["10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", 
                            "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", 
                            "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "53", 
                            "54", "55", "56", "57", "58", "59", "60"],
                        handbag: ["small", "medium", "large"],
                        accessory: ["extra small", "small", "medium", "large", "one size", "adjustable"]
                    }
                },
                {
                    element: "input",
                    type: "text",
                    id: variantColorId,
                    name: `color${newCount}`,
                    label: `Variant ${newCount} color`,
                    value: "",
                    placeholder: "Enter color"
                },
                {
                    element: "input",
                    type: "number",
                    id: variantPriceId,
                    name: `price${newCount}`,
                    label: `Variant ${newCount} price`,
                    value: "",
                    placeholder: "Enter price"
                }
            ]
        ]);
    };

    const handleChange = (event) => {
        const { id, value, name, files } = event.target;

        // Handle file input
        if (id === "productImage") {
            if (files.length > imageLimit.imagePerProduct) {
                setError(prev => ({ ...prev, [id]: `You can only add ${imageLimit.imagePerProduct} image(s).` }));
                setFile([]);
                return;
            }

            const validFiles = [];
            const newErrors = {};

            Array.from(files).forEach(file => {
                if (!file) {
                    newErrors[id] = "Not a valid file";
                    return;
                }
                
                const validTypes = ["image/png", "image/jpeg", "image/jpg"];
                if (!validTypes.includes(file.type)) {
                    newErrors[id] = "Invalid type. Only JPEG, PNG, JPG are allowed";
                    return;
                }
                
                const maxSize = 2 * 1024 * 1024;
                if (file.size > maxSize) {
                    newErrors[id] = "File size exceeds the limit (2MB)";
                    return;
                }
                
                validFiles.push(file);
            });

            if (Object.keys(newErrors).length > 0) {
                setError(prev => ({ ...prev, ...newErrors }));
                return;
            }

            setFile(validFiles);
            setError(prev => {
                const newErr = { ...prev };
                delete newErr[id];
                return newErr;
            });
            return;
        }

        // Update form field values
        const updatedFields = formField.map(field => {
            if (field.id === id) {
                return { ...field, value: value };
            }
            return field;
        });
        setFormField(updatedFields);

        // Validate other fields
        if (!value || value.trim() === "") {
            setError(prev => ({ ...prev, [id]: "This field is required" }));
        } else {
            setError(prev => {
                const newErr = { ...prev };
                delete newErr[id];
                return newErr;
            });
        }
    };

    const handleVariantChange = (variantIndex, fieldIndex, event) => {
        const { value } = event.target;
        
        const updatedVariants = [...variant];
        updatedVariants[variantIndex][fieldIndex].value = value;
        setVariant(updatedVariants);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        // Validate required fields
        const requiredFields = ["productName", "productCategory", "productSubCategory", "productDescription", "productPrice"];
        const newErrors = {};
        
        formField.forEach(field => {
            if (requiredFields.includes(field.id) && (!field.value || field.value.trim() === "")) {
                newErrors[field.id] = "This field is required";
            }
        });
        
        if (file.length === 0) {
            newErrors.productImage = "Please upload at least one product image";
        }
        
        if (Object.keys(newErrors).length > 0) {
            setError(newErrors);
            return;
        }
        
        setIsSubmitting(true);
        
        // Prepare form data
        const formData = new FormData();
        
        // Add basic product info
        formField.forEach(field => {
            if (field.id !== "productImage" && field.value) {
                formData.append(field.name, field.value);
            }
        });
        
        // Add images
        file.forEach((imageFile, index) => {
            formData.append(`productImages`, imageFile);
        });
        
        // Add variants
        variant.forEach((variantGroup, index) => {
            variantGroup.forEach(variantField => {
                if (variantField.value) {
                    formData.append(`${variantField.name}`, variantField.value);
                }
            });
        });
        
        // Log formData entries to console
        console.log("FormData being sent to backend:");
        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }
        
        try {
            let response = await CustomFetch(url, {
                method: "POST",
                body: formData
            });
            
            if (response.ok) {
                await fetchProduct(); // Refresh product list
                setHideModal(false); // Close modal
            } else {
                const errorData = await response.json();
                setError({ submit: errorData.message || "Failed to add product" });
            }
        } catch (error) {
            // setError({ submit: "Network error. Please try again." });
            setError({ submit: error.message || "An unexpected error occurred. Please try again." });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-8 bg-white rounded-[32px] shadow-[0_20px_80px_rgba(15,23,42,0.08)] border border-gray-200">
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-8">Add a Product</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {formField.map((field, index) => {
                    if (field.element === "input" && field.type === "file") {
                        return (
                            <div key={field.id} className="space-y-3">
                                <label htmlFor={field.id} className="block text-sm font-medium text-slate-700">{field.label}</label>
                                <input
                                    type="file"
                                    id={field.id}
                                    name={field.name}
                                    accept="image/*"
                                    multiple
                                    onChange={handleChange}
                                    className="w-full rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 file:mr-4 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:text-white file:font-semibold hover:file:bg-slate-800"
                                />
                                <p className="text-sm text-slate-500">
                                    {file.length > 0 ? `Selected: ${file.length} image(s)` : "Choose images to upload"}
                                </p>
                                {error[field.id] && <p className="text-sm text-red-600">{error[field.id]}</p>}
                            </div>
                        );
                    } else if (field.element === "select") {

                        if (field.id === "size") {
                            let fieldOption;
                            const categoryField = formField.find(f => f.id === "productCategory");
                            if (categoryField.value === "clothing") {
                                fieldOption = field.option.clothing;
                            }else if (categoryField.value === "footwear") {
                                fieldOption = field.option.footwear;
                            } else if (categoryField.value === "handbag") {
                                fieldOption = field.option.handbag;
                            } else if (categoryField.value === "accessory") {
                                fieldOption = field.option.accessory;
                            } else {
                                fieldOption = [];
                                return (
                                    <div key={field.id} className="space-y-2">
                                        <label htmlFor={field.id} className="block text-sm font-medium text-slate-700">{field.label}</label>
                                        <p className="text-sm text-gray-500">Please select a product category to see size options.</p>
                                    </div>
                                )
                            }
                            return (
                                    <div key={field.id} className="space-y-2">
                                        <label htmlFor={field.id} className="block text-sm font-medium text-slate-700">{field.label}</label>
                                        <select
                                            id={field.id}
                                            name={field.name}
                                            value={field.value}
                                            onChange={handleChange}
                                            className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        >
                                            <option value="" hidden>Please Select</option>
                                            {fieldOption.map((option, i) => (
                                                <option key={i} value={option}>
                                                    {option.charAt(0).toUpperCase() + option.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                        {error[field.id] && <p className="text-sm text-red-600">{error[field.id]}</p>}
                                    </div>
                        );
                        }
                        return (
                            <div key={field.id} className="space-y-2">
                                <label htmlFor={field.id} className="block text-sm font-medium text-slate-700">{field.label}</label>
                                <select
                                    id={field.id}
                                    name={field.name}
                                    value={field.value}
                                    onChange={handleChange}
                                    className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                >
                                    <option value="" hidden>Please Select</option>
                                    {field.option.map((option, i) => (
                                        <option key={i} value={option}>
                                            {option.charAt(0).toUpperCase() + option.slice(1)}
                                        </option>
                                    ))}
                                </select>
                                {error[field.id] && <p className="text-sm text-red-600">{error[field.id]}</p>}
                            </div>
                        );
                    } else if (field.element === "textarea") {
                        return (
                            <div key={field.id} className="space-y-2">
                                <label htmlFor={field.id} className="block text-sm font-medium text-slate-700">{field.label}</label>
                                <textarea
                                    rows="7"
                                    maxLength="150"
                                    name={field.name}
                                    id={field.id}
                                    placeholder={field.placeholder}
                                    value={field.value}
                                    onChange={handleChange}
                                    className="w-full resize-none rounded-3xl border border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                                {error[field.id] && <p className="text-sm text-red-600">{error[field.id]}</p>}
                            </div>
                        );
                    } else {
                        return (
                            <div key={field.id} className="space-y-2">
                                <label htmlFor={field.id} className="block text-sm font-medium text-slate-700">{field.label}</label>
                                <input
                                    type={field.type}
                                    id={field.id}
                                    name={field.name}
                                    placeholder={field.placeholder}
                                    value={field.value}
                                    onChange={handleChange}
                                    className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                                {error[field.id] && <p className="text-sm text-red-600">{error[field.id]}</p>}
                            </div>
                        );
                    }
                })}

                {/* Variant Fields */}
                {showVariant && variant.map((variantGroup, variantIndex) => (
                    <div key={variantIndex} className="border-t border-slate-200 pt-6 mt-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Variant {variantIndex + 1}</h3>
                        {variantGroup.map((variantField, fieldIndex) => {
                            if (variantField.element === "select") {
                                if (variantField.id.startsWith("VariantSize")) {
                                    let fieldOption;
                                    const categoryField = formField.find(f => f.id === "productCategory");
                                    if (categoryField.value === "clothing") {
                                        fieldOption = variantField.option.clothing;
                                    } else if (categoryField.value === "footwear") {
                                        fieldOption = variantField.option.footwear;
                                    } else if (categoryField.value === "handbag") { 
                                        fieldOption = variantField.option.handbag;
                                    } else if (categoryField.value === "accessory") {
                                        fieldOption = variantField.option.accessory;
                                    } else {
                                        fieldOption = [];
                                        return (
                                            <div key={variantField.id} className="space-y-2">
                                                <label htmlFor={variantField.id} className="block text-sm font-medium text-slate-700">{variantField.label}</label>
                                                <p className="text-sm text-gray-500">Please select a product category to see size options.</p>
                                            </div>
                                        )
                                    }

                                    return (
                                    <div key={variantField.id} className="space-y-2 mb-4">
                                        <label className="block text-sm font-medium text-slate-700">{variantField.label}</label>
                                        <select
                                            value={variantField.value}
                                            onChange={(e) => handleVariantChange(variantIndex, fieldIndex, e)}
                                            className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        >
                                            <option value="" hidden>Please Select</option>
                                            {fieldOption.map((option, i) => (
                                                <option key={i} value={option}>
                                                    {option.charAt(0).toUpperCase() + option.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                );

                                } 

                                return (
                                    <div key={variantField.id} className="space-y-2 mb-4">
                                        <label className="block text-sm font-medium text-slate-700">{variantField.label}</label>
                                        <select
                                            value={variantField.value}
                                            onChange={(e) => handleVariantChange(variantIndex, fieldIndex, e)}
                                            className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        >
                                            <option value="" hidden>Please Select</option>
                                            {variantField.option.map((option, i) => (
                                                <option key={i} value={option}>
                                                    {option.charAt(0).toUpperCase() + option.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                );
                            } else {
                                return (
                                    <div key={variantField.id} className="space-y-2 mb-4">
                                        <label className="block text-sm font-medium text-slate-700">{variantField.label}</label>
                                        <input
                                            type={variantField.type}
                                            placeholder={variantField.placeholder}
                                            value={variantField.value}
                                            onChange={(e) => handleVariantChange(variantIndex, fieldIndex, e)}
                                            className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        />
                                    </div>
                                );
                            }
                        })}
                    </div>
                ))}

                {error.submit && <p className="text-sm text-red-600 text-center">{error.submit}</p>}

                {exceedVariantOption ? (
                    <div className="space-y-4">
                        <p className="text-sm text-red-600">You have reached the maximum number of variant options.</p>
                        <button type="submit" disabled={isSubmitting} className="w-full rounded-3xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 sm:w-auto">
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-3 sm:flex sm:justify-end sm:items-center">
                        <button onClick={addToFormField} type="button" className="w-full rounded-3xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 sm:w-auto">
                            Add Variant Option
                        </button>
                        <button type="submit" disabled={isSubmitting} className="w-full rounded-3xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 sm:w-auto">
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default AddProduct;