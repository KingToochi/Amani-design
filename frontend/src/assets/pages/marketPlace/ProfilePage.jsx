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
        if (!isLoggedIn) {
        navigate("/login")
    }
    })

    return(
        <div>
        </div>
    )
}

export default ProfilePage;