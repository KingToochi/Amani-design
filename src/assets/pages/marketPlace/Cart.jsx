import { useContext, useState } from "react";
import { CartContext } from "./hooks/CartContext";
import { TbCurrencyNaira } from "react-icons/tb";
import { MdDelete } from "react-icons/md";
import { FaMinus, FaPlus } from "react-icons/fa6";


const Cart = ()=> {
    const [quantity, setQuantity] = useState(0)
    const [cart, setCart] = useContext(CartContext)

const handleMinus = (id) => {
  setCart(prevCart =>
    prevCart.map(item =>
      item.id === id
        ? { 
            ...item, 
            quantity: item.quantity > 1 ? item.quantity - 1 : 1 
          }
        : item
    )
  );
};


const handlePlus = (id) => {
    setCart(
        prevCart => prevCart.map(
            item => 
                item.id === id ?
                 {...item, quantity : item.quantity + 1 }
                 : item
        )
    )
}

const handleDelete = (id) => {
    setCart(
        prevCart => prevCart.filter(
            item => item.id !== id
        )
        )
}

    return (
        <div
        className="text-gray-50 font-[abril] text-lg mb-[75px]
        sm:text-xl
        md:text-2xl
        "
        >
            {
                cart.length < 1
                ?
                <h1>No item in Cart</h1>
                :
                <div
                className="w-full pt-4 px-2 
                sm:px-4 
                "
                >
                    {
                        cart.map(cartItems => (
                            <div
                            className="w-full flex  gap-2 mb-4 h-[200px] items-center px-2 border-b-1 
                            sm:gap-4 
                            lg:h-[300px]
                            "
                            >
                                <div 
                                className="w-[30%] 
                                lg:w-[20%]
                              "
                                >
                                    <img src={cartItems.productImage} 
                                    className="w-full object-conver rounded-lg break-inside-avoid
                                    sm:h-[200px] 
                                    lg:object-contain
                                    "
                                    />
                                </div>
                                <div
                                className="w-[40%] flex flex-col"
                                >
                                    <h1 className="font-semibold">{cartItems.productName}</h1>
                                    <h1>Size: {cartItems.size}</h1>
                                    <h1>color: {cartItems.color}</h1>
                                    <h1 className="flex items-center "><TbCurrencyNaira/>{cartItems.productPrice}</h1>
                                </div>
                                <div 
                                className="flex flex-col w-[30%] h-full justify-between py-6"
                                >
                                    <button onClick={() => handleDelete(cartItems.id)}
                                    className="self-end cursor-pointer"
                                    >
                                        <MdDelete />
                                    </button>
                                    <div
                                    className="flex self-end gap-4 "
                                    >
                                        <button onClick={() => {handleMinus(cartItems.id)}}
                                            className=" border-1 rounded-lg border-gray-300 px-1 cursor-pointer"
                                            >
                                            <FaMinus/>
                                        </button>
                                        {cartItems.quantity}
                                        <button onClick={() => {handlePlus(cartItems.id)}}
                                            className=" border-1 rounded-lg border-gray-300 px-1 cursor-pointer"
                                        >
                                            <FaPlus/>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                </div>
            }
        </div>
    )
}

export default Cart;