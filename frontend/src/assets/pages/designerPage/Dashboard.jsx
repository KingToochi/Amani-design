import { useState, useEffect, useContext } from "react";
import AuthProvider from "../marketPlace/hooks/AuthProvider";  
import {BASE_URL} from "../../Url";

const Dashboard = () => {
    const url = BASE_URL;
    const { auth } = useContext(AuthProvider);
    const token = localStorage.getItem("token");
    const [sales, setSales] = useState({});
    const [orders, setOrders] = useState({});
    const [comments, setComments] = useState({});
    const [ratings, setRatings] = useState({});
    const [loading, setLoading] = useState(true);
    const fetchData = async () => {
        try {
            if (!token) return;
        if(auth.role !== "designer") return;

        const productAnalytics = await fetch(`${url}/designer/productAnalytics`, {
            method: "GET",
            headers: {
                authorization : `Bearer ${token}`
            }
        })
        let data = await productAnalytics.json();
        if (data.success) {
            setSales(data.sales);
            setOrders(data.orders);
            setComments(data.comments);
            setRatings(data.ratings);
             setLoading(false);
        }
        console.log(data);

        }catch(err){

        }
    }

    useEffect(() => {
        fetchData();
    }, [token]);

    


return(
    <div>
        
    </div>
)
}



export default Dashboard;