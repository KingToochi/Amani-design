// src/components/FlutterwavePayment.jsx
import logo from "../images/mainLogo.jpg";
import { BASE_URL } from "../Url";

const FlutterwavePayment = ({
  userInfo,
  amount,
  paymentMethod,
  cartItems,
  cart = []
}) => {
  const redirectUrl = `${window.location.origin}/payment-callback`;
  const API_URL = BASE_URL;

  const handlePayment = async () => {
    try {
      const response = await fetch(`${API_URL}/createPayment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          amount,
          currency: "NGN",
          email: userInfo?.email || "",
          name: `${userInfo?.fname || ""} ${userInfo?.lname || ""}`.trim(),
          phoneNumber: userInfo?.phoneNumber || "",
          cart: cartItems || cart,
          redirectUrl,
          txRef: `AMANI-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          description: `Payment for ${(cartItems || cart)?.length || 0} items`
        })
      });

      const result = await response.json();

      if (result.success && result.link) {
        window.location.href = result.link;
      } else {
        alert(result.message || "Unable to initialize payment");
      }
    } catch (error) {
      console.error("Payment initialization error:", error);
      alert("Unable to initialize payment. Please try again.");
    }
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