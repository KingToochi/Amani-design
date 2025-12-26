import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {AuthContext} from "./hooks/AuthProvider"
import { CiEdit } from "react-icons/ci";
const ProfilePage = () => {
    const {setAuth} = useContext(AuthContext)
    const [userDetails, setUserDetails] = useState({})
    const  token = localStorage.getItem("token");

    const navigate = useNavigate()

    const fetchUserData = async() => {
        try{
            let response = await fetch("https://amani-design-backend.onrender.com/users", {
                method: "GET",
                headers: {
                    "Authorization" : `Bearer ${token}`
                }
            })
            let data = await response.json()
            console.log(data)
            setUserDetails(data)

        } catch (error) {
            
        }
    }


    useEffect(()  =>{
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
            } if (!decoded._id) {
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

            fetchUserData()
        } catch(error) {
            console.error("Invalid token:", error)
            localStorage.removeItem("token")
            navigate("/login")
        }
    }, [])


    return(
        <div>
           <div>
                <img src={userDetails?.profilePicture} alt="profile Picture" />
                <h1>{userDetails?.username}</h1>
           </div>
           <div>
                <div>
                    <h1>First Name: {userDetails?.fname}</h1>
                    <CiEdit />
                </div>
                <div>
                    <h1>Last Name: {userDetails?.lname}</h1>
                    <CiEdit />
                </div>
                <div>
                    <h1>Username: {userDetails?.username}</h1>
                    <CiEdit />
                </div>
                <div>
                    <h1>Email Address: {userDetails?.email}</h1>
                    <CiEdit />
                </div>
                <div>
                    <h1>Status: {userDetails?.status}</h1>
                    <CiEdit />
                </div>
                <div>
                    <h1>{userDetails?.meansOfIdentification}: {userDetails?.identificationNumber}</h1>
                    <CiEdit />
                </div>
                {userDetails?.shippingAddress && 
                    (<div>
                        <h1>Shipping Address: {userDetails.shippingAddress}</h1>
                        <CiEdit />
                    </div>)
                }
           </div>
        </div>
    )
}

export default ProfilePage;