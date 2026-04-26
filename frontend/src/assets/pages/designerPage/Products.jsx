import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import AddProduct from "./AddProduct";
import { FaRegEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { FaNairaSign } from "react-icons/fa6";
import { BASE_URL } from "../../Url";
import { AuthContext } from "../marketPlace/hooks/AuthProvider";
import ServerError from "../../components/ServerError";


const Products = () => {
    const [productList, setProductList] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [serverError, setServerError] = useState  (null)
    const [loading, setLoading] = useState(true)
    const [alertModal, setAlertModal] = useState(false)
    const [alert, setAlert] = useState(null)
    const [imageLimits, setImageLimits] = useState(null)
    const url = BASE_URL
    const {auth} = useContext(AuthContext)
    const token = localStorage.getItem("token")
    const subscriber = auth.subscriber
    const plan = auth.subscriptionPlan
    const status = auth.subscriptionStatus
    const isExpired = new Date(auth.subscriptionExpiryDate).getTime() < new Date().getTime()  

    const fetchProduct = async () => {
        try{
            let response = await fetch (`${url}/products/designer`, {
                method : "GET",
                headers : {Authorization : `Bearer ${token}`}
            })
            const data = await response.json()
            if (!data.success) {
                setLoading(false)
                setServerError({ message: data.message });
                setTimeout(() => setServerError(null), 5000); // Clear error after 5 seconds
            }
            setProductList(data.products || [])
            console.log(data.products)
            setLoading(false)
        }catch(error) {
            console.log(error)
            setLoading(false)
            setServerError({ message: "Failed to fetch products" })
            setTimeout(() => setServerError(null), 5000); // Clear error after 5 seconds
        }
    }

    useEffect(() => 
        {
            fetchProduct()
        }, [])

    if (auth.role !== "vendor" && auth.role !== "designer") {
        return (
            <div className="flex justify-center items-center h-screen">
                <p>Access denied. Please log in.</p>
            </div>
        );
    }

    // if (auth.status === "pending") {
    //     return (
    //         <div className="flex justify-center items-center h-screen">
    //             <p>Your account is pending approval. Please wait for an admin to approve your account.</p>
    //         </div>
    //     );
    // }

    if (auth.status === "rejected") {
        return (
            <div className="flex justify-center items-center h-screen">
                <p>Access denied. Please log in.</p>
            </div>
        );
    }


        const handleAddProduct = () => {
            const limit = imageLimit()
            setImageLimits(limit)
                if (limit.maxProducts === 0) {
                    setAlertModal(true)
                    if (isExpired || status === "past_due") return setAlert({message : "your subscription has expired, reactivate your subscription to add products"})
                    if (status === "inactive") return setAlert({message: "your subscription has been cancelled, activate your aubacription to add products"})
                } else if (productList.length >= limit.maxProducts) {
                    setAlertModal(true) 
                    return setAlert({message : "upgrade your subscription to add more image"})
            } else {
                setShowModal((prev) => (!prev))
            }
            
        }

        const displayAddProductModal = () => {
            if (showModal) {
                return(
                    <div
                    className="w-full absolute m-h-screen bg-gray-50 px-4 py-2 z-100 top-0 
                    md:w-[75%]
                    lg:w-[82%]
                    xl:w-[85%]
                    "
                    >
                        <div
                         className="w-full flex items-center justify-end px-2 py-2 gap-4"
                        >
                            <button onClick={() => setShowModal(false)}
                            className="flex items-right cursor-pointer"
                            >
                                <h1
                                className="text-2xl font-semibold text-red-400"
                                >X</h1>
                            </button>
                        </div>
                        <AddProduct  setHideModal = {setShowModal} fetchProduct = {fetchProduct} productList = {productList} imageLimits = {imageLimits}/>
                    </div>
                )
            }
        }



        const imageLimit = () => {
            
            // check if user subscription hasnt expire 
            if (subscriber && isExpired) {
                return {maxProducts: 0, imagePerProduct: 0}
            }
            
            // check if user is a subscriber and has an active subscription
            if (subscriber && status === "active") {
                if (plan === "basic") return {maxProducts: 10, imagePerProduct: 1}
                if (plan === "standard") return {maxProducts: 20, imagePerProduct: 3}
                if (plan === "premium") return {maxProducts: Infinity, imagePerProduct: 5}
            } else if (subscriber && ["inactive", "past_due", "cancelled"].includes(status)  && isExpired) {
                return {maxProducts: 0, imagePerProduct: 0}
            } else {
                return {maxProducts: 3, imagePerProduct: 1}
            }
        }

        if (loading) {
            return (
                <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            );
        }   

        const displayAlertModal = () =>{
            if (alertModal) {
                return(
                    <div className="w-full fixed inset-0 bg-gray-50 px-4 py-2
                    md:fixed md:left-39 right-0 top-0 bottom-0 md:w-[80%]
                    lg:left-51">
                        <h1 className="text-xl font-semibold text-red-500">{alert.message}</h1>
                        <Link to="" className="text-blue-500 underline">Upgrade Your Subscription</Link>
                        <button onClick={() => setAlertModal(false)} className="px-4 py-2 bg-blue-500 text-white rounded">Close</button>
                    </div>
                )
            }
        } 


         if (serverError) {
        return <ServerError serverError={serverError} />;
    }


        return (
            <div>
                 { displayAddProductModal()}
                 {displayAlertModal()}
                {(productList.length === 0) ?
                <div className="flex flex-col items-center justify-center h-screen gap-4">
                    <h1 className="text-2xl font-semibold">No products found. Please add a product.</h1>
                    <button onClick={handleAddProduct} className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer">Add Product</button>
                </div>
                :
                <div className="p-4">
                    <div className="flex justify-end mb-4">
                        <button onClick={handleAddProduct} className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer">Add Product</button> 
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {productList?.map((product) => (
                            <Link key={product._id} to={`/productdetails/${product._id}`}>
                                <div className="border rounded p-4">
                                    <h2 className="text-xl font-semibold">{product.name}</h2>
                                    <p className="text-gray-600">{product.description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
                }
            </div>
        )
}

export default Products;


 