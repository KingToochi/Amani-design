import {useState, useContext} from 'react';
import { BASE_URL } from '../../Url';
import { AuthContext } from './hooks/AuthProvider';
import {cartContext} from './hooks/CartContext';

const CheckOut = () => {
    const [userInfo, setuserInfo] = useState({})
    const {cart} = useContext(cartContext)
    const url = BASE_URL
    const token = localStorage.getItem("token") 

    const fetchUserinfo = async () => {
    // Check if token exists
    if (!token) {
        console.error('No authentication token available');
        return;
    }

    try {
        const response = await fetch(`${url}/userInfo`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`, // 'authorization' -> 'Authorization' (standard)
                'Content-Type': 'application/json'
            }
        });

        // Check if response is OK (status in the range 200-299)
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setuserInfo(data.user);
        return data; // Optional: return data for chaining
    } catch (error) {
        console.error('Error fetching user info:', error);
        // You might want to set an error state here
        // setError('Failed to load user information');
    }
};



    return (
        <div>
            <h2>Checkout</h2>
            {/* Render shipping info here */}
        </div>
    );
}

export default CheckOut;