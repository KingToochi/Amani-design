import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {AuthContext} from "./hooks/AuthProvider"
const ProfilePage = () => {
    const {auth, setAuth} = useContext(AuthContext)

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
        const decoded = jwtDecode(token)
        console.log(decoded)
        setAuth({
                    id : decoded.id,
                    email: decoded.email,
                    username: decoded.username,
                    status: decoded.status,
                    exp: decoded.exp,
                    iat: decoded.iat
        })
        if (!decoded.id) {
        navigate("/login")
    } else{
         console.log("User logged in:", token);
    }
    }, [])

    return(
        <div>
        </div>
    )
}

export default ProfilePage;