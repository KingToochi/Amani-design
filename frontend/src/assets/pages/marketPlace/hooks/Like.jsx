import { createContext, useState } from "react";

export const LikeContext = createContext()

const LikeProduct = ({children}) => {
    const [like, setLike] = useState([])

    return (
        <LikeContext.Provider value={[like, setLike]}>
            {children}
        </LikeContext.Provider>
    )
}

export default LikeProduct;