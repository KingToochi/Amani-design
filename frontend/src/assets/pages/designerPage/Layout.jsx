import Header from "./Header";
import { Outlet } from "react-router-dom";
import SideBar from "./SideBar";
import { useState, useEffect } from "react";
import { BASE_URL } from "../../Url";
const Layout = () => {
    
    const url = BASE_URL
    const token = localStorage.getItem("token")
    const [userData, setUserData] = useState()
    const [serverError, setServerError] = useState(null)
    const fetchUser = async () => {
        try {
            let response = await fetch(`${url}/users`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }   
            });
            const data = await response.json();
            console.log(data)
            setUserData(data.userData)
            console.log(data.userData)
        }catch(error){
            console.log(error)
            setServerError(error)

        }
    }

    useEffect(() => {
        fetchUser()
    },[])



return(
    <div
    className="w-full flex"
    >
        <SideBar 
        className="hidden md:flex"
        userData = {userData}
        />
        <div
        className="flex flex-col w-full md:w-[75%] lg:w-[82%] xl:w-[85%]"
        >
            <Header userData = {userData} />
            <Outlet />
        </div>
    </div>
)
}

export default Layout;