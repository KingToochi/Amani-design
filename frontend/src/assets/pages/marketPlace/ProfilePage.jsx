import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const ProfilePage = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const navigate = useNavigate()


    useEffect(()  =>{
        if (!isLoggedIn) {
        navigate("/registration")
    }
    })

    return(
        <div>
        </div>
    )
}

export default ProfilePage;