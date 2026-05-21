import Header from "./Header";
import { Outlet } from "react-router-dom";
import SideBar from "./SideBar";
import { useState, useEffect } from "react";
import { BASE_URL } from "../../Url";
import CustomFetch from "../../hooks/UseFetch";
const Layout = () => {
    
    const url = `${BASE_URL}/users`
    const [userData, setUserData] = useState()


    const fetchUser = async() => {
        try {
            let user = await CustomFetch(url)
            const data = await user.json();
            setUserData(data.userData)
        } catch (error){
            console.log(error)
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