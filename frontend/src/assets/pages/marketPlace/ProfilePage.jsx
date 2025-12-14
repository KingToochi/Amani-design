import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {AuthContext} from "./hooks/AuthProvider"
const ProfilePage = () => {
    const {setAuth} = useContext(AuthContext)

    const navigate = useNavigate()

    const fetchUserData = async() => {
        try{
            let response = await fetch("https://amani-design-backend.onrender.com/users")
            let data = await response.json()

        } catch (error) {
            
        }
    }


    useEffect(()  =>{
        const token = localStorage.getItem("token");
        console.log("TOKEN:", token)

        if(!token) {
            navigate("/login")
            return
        }
    
        try {
            const decoded = jwtDecode(token)
            console.log(decoded)
            const currentTime = Date.now() / 1000
            if (decoded.exp < currentTime) {
                alert("Token has expired") 
                localStorage.removeItem("token")
                navigate("/login")
                return
            } if (!decoded.id) {
                navigate("/login")
                return
            } else {
                setAuth({
                    id : decoded.id,
                    email: decoded.email,
                    username: decoded.username,
                    status: decoded.status,
                    exp: decoded.exp,
                    iat: decoded.iat
                })
            }
        } catch(error) {
            console.error("Invalid token:", error)
            localStorage.removeItem("token")
            navigate("/login")
        }
    }, [])

    return(
        <div>
            Welcome
        </div>
    )
}

export default ProfilePage;