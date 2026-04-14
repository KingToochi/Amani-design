// src/components/FlutterwavePayment.jsx
import { useFlutterwave, closePaymentModal } from "flutterwave-react-v3";
import logo from "../images/mainLogo.jpg"; // Make sure this path is correct
import  { BASE_URL } from "../Url";

const FlutterwavePayment = ({ 
  userInfo, 
  amount, 
  paymentMethod,
  cartItems
  
}) => {
  
  // ✅ Call the hook to get the payment function
  const handleFlutterPayment = useFlutterwave({
    public_key: "FLWPUBK-5b72307ca09d03e7919816871e8dbf63-X",
    tx_ref: `AMANI-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    amount: amount,
    currency: "NGN",
    payment_options: paymentMethod || "card, ussd, mobilemoney",
    redirect_url: `${window.location.origin}/payment-callback`,
    customer: {
      email: userInfo?.email || '',
      phone_number: userInfo?.phoneNumber || '',
      name: `${userInfo?.fname || ''} ${userInfo?.lname || ''}`.trim()
    },
    customizations: {
      title: "Amanisky Fashion World",
      description: `Payment for ${cartItems?.length || 0} items`,
      logo: logo,
    },
  });

  const API_URL =  BASE_URL;

  const handlePayment = () => {
    handleFlutterPayment({
      callback: async (response) => {
        console.log("Payment response:", response);
        
        if (response.status === "successful") {
          try {
            // Show loading state (optional)
            // You might want to add a loading indicator here
            
            const verifyRes = await fetch(`${API_URL}/api/verify-payment`, {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                // Add auth token if needed
                // "Authorization": `Bearer ${localStorage.getItem("token")}`
              },
              body: JSON.stringify({
                transaction_id: response.transaction_id,
                amount: amount, // Use amount prop, not totalAmount
                customer_email: userInfo?.email,
                customer_name: `${userInfo?.fname || ''} ${userInfo?.lname || ''}`.trim(),
                cart_items: cartItems, // Pass cart items
                payment_method: paymentMethod
              }),
            });

            const result = await verifyRes.json();

            if (result.success) {
              // Redirect directly to success page
              window.location.href = `/order-success/${result.data.orderId}`;
            } else {
              alert(`Payment verification failed: ${result.message || 'Unknown error'}`);
            }
          } catch (error) {
            console.error("Verification error:", error);
            alert(`Payment verification failed. Please contact support with Transaction ID: ${response.transaction_id}`);
          }
        } else {
          alert("Payment was not successful. Please try again.");
        }
        
        closePaymentModal();
      },
      onClose: () => {
        console.log("Payment modal closed");
        // Optional: You can add logic here for when modal closes without payment
        // For example, redirect back to checkout
        // window.location.href = '/checkout';
      },
    });
  };

  return (
    <button
      onClick={handlePayment}
      style={{
        backgroundColor: "#F97316",
        color: "white",
        padding: "12px 24px",
        border: "none",
        borderRadius: "5px",
        fontSize: "16px",
        cursor: "pointer",
        width: "100%",
        fontWeight: "600",
        transition: "background-color 0.3s ease",
      }}
      onMouseEnter={(e) => e.target.style.backgroundColor = "#fb923c"}
      onMouseLeave={(e) => e.target.style.backgroundColor = "#F97316"}
    >
      Pay ₦{amount?.toLocaleString() || '0'}
    </button>
  );
};

export default FlutterwavePayment;