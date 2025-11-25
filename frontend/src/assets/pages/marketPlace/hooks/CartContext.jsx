import { createContext, useState } from "react"

export const CartContext = createContext(null)

const MyCart = ({children}) => {
    const [cart, setCart] = useState([])
    console.log("MyCart mounted");



    return (
        <CartContext.Provider value={[cart, setCart]}>
          {children}
        </CartContext.Provider>
    )
}

export default MyCart;