import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AddProduct from "./AddProduct";
import { FaRegEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { FaNairaSign } from "react-icons/fa6";
import { BASE_URL } from "../../Url";

const Products = () => {
    const [productList, setProductList] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [editProductById, setEditProductById] = useState(null)
    const url = BASE_URL
    const fetchProduct = async () => {
        const token = localStorage.getItem("token")
        try{
            let response = await fetch (`${url}/designer`, {
                method : "GET",
                headers : {Authorization : `Bearer ${token}`}
            })
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
                    await fetch(`${url}/${id}`, {
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
                    let response = await fetch(`${url}/${id}`, {
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
                        <AddProduct  setHideModal = {setShowModal} fetchProduct = {fetchProduct}/>
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
                className="text-lg font-semibold font-[abril] text-gray-700
                sm:text-xl
                "
                >
                    No product yet
                </h1>
                <button onClick={handleAddProduct}
                className="w-auto border-2 border-gray-500 rounded-lg px-2 py-2 cursor-pointer"
                >
                    <Link 
                    className="text-lg font-semibold font-[abril] text-gray-700
                sm:text-2xl
                "
                    >
                        Add Product
                    </Link>
                </button>
            </div>

            : 
            <div
            className="flex flex-col bg-gray-50 w-full py-4"
            >
                <div className="w-full flex justify-end ">
                    <button
                    onClick={handleAddProduct}
                    className="mr-5 font-[abril] font-semibold w-auto px-2 py-2 rounded-lg border-2 cursor-pointer"
                    >
                        <h1
                        className="text-lg
                        sm:text-xl
                        "
                        >Add new Product</h1>
                    </button>
                </div>
                <div
                className="columns-2 md:columns-3 lg:columns-4 gap-2 px-4 py-2 
                "
                >
                {productList.map(
                    product => (
                        <div key={product.id}
                        className="break-inside-avoid overflow-hidden rounded-lg mb-2 "
                        >
                            <Link to={`/productdetails/${product.id}`} className="cursor-pointer">
                                <img src={product.productImage} 
                                className="w-full object-cover rounded-xl
                                " 
                            />
                            </Link>
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


 