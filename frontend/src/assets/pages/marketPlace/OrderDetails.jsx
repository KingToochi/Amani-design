import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { BASE_URL } from "../../Url";

const OrderDetails = () => {

    const {id} = useParams
    const url = `${BASE_URL}/customerOrderDetails/${id}`
}

export default OrderDetails;