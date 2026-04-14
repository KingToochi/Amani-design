// src/pages/PaymentCallback.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const PaymentCallback = () => {
  const [status, setStatus] = useState("processing");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Get transaction details from URL
    const params = new URLSearchParams(location.search);
    const transactionId = params.get("transaction_id");
    const paymentStatus = params.get("status");
    const txRef = params.get("tx_ref");

    console.log("Callback received:", { transactionId, paymentStatus, txRef });

    if (paymentStatus === "successful") {
      setStatus("success");
      setTimeout(() => {
        navigate("/orders");
      }, 3000);
    } else if (paymentStatus === "cancelled") {
      setStatus("cancelled");
      setTimeout(() => {
        navigate("/checkout");
      }, 3000);
    } else {
      setStatus("failed");
      setTimeout(() => {
        navigate("/checkout");
      }, 3000);
    }
  }, [location, navigate]);

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      {status === "processing" && (
        <>
          <h2>Processing your payment...</h2>
          <div className="spinner"></div>
        </>
      )}
      
      {status === "success" && (
        <>
          <h2 style={{ color: "green" }}>✅ Payment Successful!</h2>
          <p>Thank you for your purchase. Redirecting to your orders...</p>
        </>
      )}
      
      {status === "failed" && (
        <>
          <h2 style={{ color: "red" }}>❌ Payment Failed</h2>
          <p>Your payment was not completed. Redirecting to checkout...</p>
        </>
      )}
      
      {status === "cancelled" && (
        <>
          <h2 style={{ color: "orange" }}>⚠️ Payment Cancelled</h2>
          <p>You cancelled the payment. Redirecting to checkout...</p>
        </>
      )}
    </div>
  );
};

export default PaymentCallback;