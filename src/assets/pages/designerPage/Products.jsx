import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AddProduct from "./AddProduct";
import { FaRegEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { FaNairaSign } from "react-icons/fa6";

const Products = () => {
    const [productList, setProductList] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [editProductById, setEditProductById] = useState(null)
    const fetchProduct = async () => {
        try{
            let response = await fetch ("http://localhost:3000/products")
            const products = await response.json()
            setProductList(products)
            console.log(products)
        }catch(error) {
            console.log(error)
        }
    }

    useEffect(() => 
        {
            fetchProduct()
        }, [])

        const handleAddProduct = () => {
            setShowModal((prev) => (!prev))
        }

        const handleEdit = (id) => {
            setEditProductById((prev) =>  (prev === id ? null : id))
        }
          
        const handleChange = (e, id) => {
            const { name, value } = e.target;
            setProductList(prev =>
            prev.map(product =>
            product.id === id ? { ...product, [name]: value } : product
            )
        );
    };

        const handleDelete = async (id) => {
            try {
                    await fetch(`http://localhost:3000/products/${id}`, {
                    method: "DELETE",
                });
                setProductList(prev => prev.filter(product => product.id !== id));
            } catch (error) {
                console.log("Error deleting product:", error);
            }
        };

        const handleSubmit = async(event, id) => {
            event.preventDefault()

            const productToUpdate = productList.find(product => product.id === id)
            if (!productToUpdate) return;
                try {
                    let response = await fetch(`http://localhost:3000/products/${id}`, {
                        method: "PUT",
                        body:JSON.stringify( productToUpdate),

                    })
                    if(!response.ok) throw new Error("unable to put")
                    const data = await response.json()
                    console.log("product data update", data)

                    setEditProductById(null)
                    fetchProduct()

                } catch(error) {
                    console.log(error)
                }
        }

     

        const displayAddProductModal = () => {
            if (showModal) {
                return(
                    <div
                    className="w-full fixed inset-0 bg-gray-50 px-4 py-2
                    md:fixed md:left-39 right-0 top-0 bottom-0 md:w-[80%]
                    lg:left-51
                    xl:left-64
                    "
                    >
                        <div
                         className="w-full flex items-center justify-end px-2 py-2 gap-4t"
                        >
                            <button onClick={handleAddProduct}
                            className="flex items-right"
                            >
                                <h1
                                className="text-2xl font-semibold text-red-400"
                                >X</h1>
                            </button>
                        </div>
                        <AddProduct />
                    </div>
                )
            }
        }


    return(
        <>
        {
            (productList.length < 1) 
            ?
            <div className="w-full min-h-screen flex flex-col items-center mt-6 gap-6">
                <h1
                className="text-2xl font-semibold font-[abril] text-gray-700
                md:text-3xl
                "
                >
                    No product yet
                </h1>
                <button onClick={handleAddProduct}
                className="w-auto border-2 border-gray-500 rounded-lg px-2 py-2 cursor-pointer"
                >
                    <Link 
                    className="text-xl font-semibold font-[abril] text-gray-700
                md:text-2xl
                "
                    >
                        Add Product
                    </Link>
                </button>
            </div>

            : 
            <div
            className="flex flex-col bg-gray-50 mt-2 py-4"
            >
                <div className="w-full flex justify-end ">
                    <button
                    onClick={handleAddProduct}
                    className="mr-5 font-[abril] w-auto px-2 py-2 rounded-lg border-2 cursor-pointer"
                    >
                        <h1
                        className="md:text-2xl"
                        >Add new Product</h1>
                    </button>
                </div>
                <div
                className="grid grid-cols-2 w-full h-auto gap-4 px-4 py-2
                md:grid-cols-3
                lg:grid-cols-4
                "
                >
                {productList.map(
                    product => (
                        <div key={product.id}
                        className="w-full flex flex-col items-center gap-2 border-2 border-gray-700 rounded-lg px-2 py-2 bg-gray-200"
                        >
                            <img src={product.productImage} 
                            className="w-full h-[200px] rounded-xl
                            sm:h-[400px] 
                            md:h-[250px]
                            lg:h-[250px]
                            " 
                            />
                            {editProductById === product.id ?
                            <form onSubmit={(e) => handleSubmit(e, product.id)}
                            className="flex flex-col w-full font-[abril] items-center gap-1"
                            >
                                <textarea maxLength="150" name="productDescription" id="productDescription"  placeholder="Description ......"
                                className="w-full focus:outline-none" onChange={(e) => handleChange(e, product.id)} value={product.productDescription || ""}
                                ></textarea>
                                <select id="productCategory" name="productCategory" value={product.productCategory || ""}
                                className="w-full flex flex-col font-[abril]" onChange={(e) => handleChange(e, product.id)}
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
                                className="flex w-full sm:text-xl font-[abril]"
                                >
                                    <label htmlFor="productPrice" className="font-[abril] hidden">Price:</label>
                                    <div
                                    className="flex border-2 border-gray-700 rounded-lg w-full px-2 py-2 items-center gap-2"
                                    >
                                        <FaNairaSign />
                                        <input type="number" name="productPrice" id="productPrice" value={product.productPrice || ""}
                                         onChange={(e) => handleChange(e, product.id)}
                                        className="focus:outline-none"
                                        />
                                    </div>
                                </div>
                                <button className="w-full border-1 border-gray-700 font-[abril] px-2 py-2 rounded-lg text-pink-700" type="submit">
                                    <h1>Update</h1>
                                </button>
                            </form>
                            :
                            <div
                            className="flex flex-col w-full font-[abril] items-center gap-1"
                            >
                                <h1
                                className="w-full flex truncate"
                                >
                                    {product.productDescription}
                                </h1>
                                <h1
                                className="w-full flex truncate"
                                >
                                    {product.productCategory}
                                </h1>
                                <h1
                                className="w-full flex truncate flex items-center"
                                >
                                    <FaNairaSign/>{product.productPrice}
                                </h1>
                                <div
                                className="w-full flex justify-around"
                                >
                                    <FaRegEdit className="text-blue-800 font-semibold text-2xl cursor-pointer" onClick={() => handleEdit(product.id)}/>
                                    <MdDeleteForever className="text-red-800 semibold text-2xl cursor-pointer" onClick={() => handleDelete(product.id)}/>
                                </div>
                            </div>
                            }
                        </div>
                    )
               )}
                </div>
            </div>
        }

        {displayAddProductModal()}
        </>
    )
}

export default Products;


 