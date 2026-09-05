import { useParams } from "react-router-dom";
import { BASE_URL } from "../../Url";
import CustomFetch from "../../hooks/useFetch";
import { useState, useEffect } from "react";

const AuthenticateVendor = () => {
    const {vendorDetails, setVendorDetails} = useState()

    const {_id} = useParams()
    const url = `${BASE_URL}/admin/autheticatedVendor/${_id}`

    const fetchVendor = async() => {

        try{
            let response = await CustomFetch(url, {
            "method" : GET
        })

        const vendor = await response.json()

        if (vendor.ok) {
            setVendorDetails(vendor)
        }
        }catch(error){
            console.log(error)
        }
    }

    useEffect(() => {
        fetchVendor()
    }, [])

}

export default AuthenticateVendor;