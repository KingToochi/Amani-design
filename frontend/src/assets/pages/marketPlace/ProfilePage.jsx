import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const ProfilePage = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
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
        if (!token) {
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