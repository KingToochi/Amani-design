import { Children } from "react";
import { createContext, useState } from "react";

export const Authcontext = createContext({})

const AuthProvider = ({children}) => {
    const [auth, setAuth] = useState({})

    return (
        <Authcontext.Provider value={{auth, setAuth}}>
            {children}
        </Authcontext.Provider>
    )
}

export default AuthProvider;