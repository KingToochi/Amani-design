import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BASE_URL } from "../../../Url";
import CustomFetch from "../../../hooks/UseFetch";

import { CartContext } from "../../../context/CartContext";
// import your CustomFetch
// import your verifyPaymentUrl

const PaymentCallback = () => {

    const [status, setStatus] = useState("processing");
    const verifyPaymentUrl = `${BASE_URL}/payment/verify`

    const location = useLocation();
    const navigate = useNavigate();

    const [cart, setCart] = useContext(CartContext);

    useEffect(() => {

        const verifyPayment = async () => {

            // Get reference from Paystack callback URL
            const params = new URLSearchParams(location.search);

            const reference = params.get("reference");

            console.log("Paystack reference:", reference);

            if (!reference) {
                console.error("Payment reference not found");

                setStatus("failed");

                setTimeout(() => {
                    navigate("/checkout");
                }, 3000);

                return;
            }

            try {

                // Send reference to your backend
                const response = await CustomFetch(
                    verifyPaymentUrl,
                    {
                        method: "POST",

                        credentials: "include",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({
                            reference,
                            cart
                        })
                    }
                );

                const responseData =
                    await response.json();

                console.log(
                    "Payment verification response:",
                    responseData
                );

                if (
                    !response.ok ||
                    !responseData.success
                ) {

                    setStatus("failed");

                    setTimeout(() => {
                        navigate("/checkout");
                    }, 3000);

                    return;
                }

                console.log(responseData)

                // Payment successfully verified
                setStatus("success");

                // Clear cart if your CartContext supports it
                setCart([]);

                setTimeout(() => {
                    navigate("/customer-orders");
                }, 3000);

            } catch (error) {

                console.error(
                    "Payment verification error:",
                    error
                );

                setStatus("failed");

                setTimeout(() => {
                    navigate("/checkout");
                }, 3000);
            }
        };

        verifyPayment();

    }, [location.search, navigate]);

    return (
        <div
            style={{
                textAlign: "center",
                padding: "50px"
            }}
        >

            {status === "processing" && (
                <>
                    <h2>
                        Processing your payment...
                    </h2>

                    <div className="spinner"></div>
                </>
            )}

            {status === "success" && (
                <>
                    <h2 style={{ color: "green" }}>
                        ✅ Payment Successful!
                    </h2>

                    <p>
                        Thank you for your purchase.
                        Redirecting to your orders...
                    </p>
                </>
            )}

            {status === "failed" && (
                <>
                    <h2 style={{ color: "red" }}>
                        ❌ Payment Failed
                    </h2>

                    <p>
                        Your payment could not be
                        verified. Redirecting to checkout...
                    </p>
                </>
            )}

            {status === "cancelled" && (
                <>
                    <h2 style={{ color: "orange" }}>
                        ⚠️ Payment Cancelled
                    </h2>

                    <p>
                        You cancelled the payment.
                        Redirecting to checkout...
                    </p>
                </>
            )}

        </div>
    );
};

export default PaymentCallback;