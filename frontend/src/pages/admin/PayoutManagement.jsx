import { useState, useEffect } from "react"
import { BASE_URL } from "../../Url"
import CustomFetch from "../../hooks/useFetch";


const PayoutManagement = () => {
  const url = `${BASE_URL}/admin/vendorPayout`

  useEffect(() => {
    const fetchVendorsDueForPayout = async() => {
      try {
        const fetchvendors = await CustomFetch(url, {
          method  : "GET"
        }) 
        const response = fetchvendors.json()
        console.log(response)
      }catch(error) {
        console.log(error)
      }
    }

    fetchVendorsDueForPayout()
  },
  [])
  

}

export default PayoutManagement