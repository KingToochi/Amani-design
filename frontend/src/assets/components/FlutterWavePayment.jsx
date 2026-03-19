import logo from "../images/mainLogo.jpg"
import { useFlutterwave, closePaymentModal } from "flutterwave-react-v3";

const FlutterwavePayment = ({userInfo, total, paymentMethod}) => {
    const flutterwaveConfig = {
        public_key : "929973db-d631-438f-966b-5b8fd19c1dcd",
        tx_ref: "AmaniSKy" + Date.now(),
        amount: total,
        currency: "NGN",
        payment_options: paymentMethod,
        redirect_url: `${window.location.origin}/payment-callback`,
        customer: {
            email: userInfo.email,
            phone_number: userInfo.phoneNumber,
            name: userInfo.fname + " " + userInfo.lname
        },
        customizations: {
      title: "Amanisky Fashion World",
      description: "Payment for items in cart",
      logo: logo,
    },
    }
    const handlePayment = () => {
    handleFlutterPayment({
      callback: async (response) => {
        console.log("Payment response:", response);
        
        if (response.status === "successful") {
          // Call your backend to verify
          try {
            const verifyRes = await fetch(
              `${process.env.REACT_APP_API_URL}/api/verify-payment`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  transaction_id: response.transaction_id,
                  amount: totalAmount,
                  customer_email: userInfo.email,
                  cart_items: cartItems,
                }),
              }
            );

            const result = await verifyRes.json();

            if (result.success) {
              // Redirect to success page
              window.location.href = `/order-success/${result.data.orderId}`;
            }
          } catch (error) {
            console.error("Verification error:", error);
            alert("Payment verification failed. Please contact support.");
          }
        }
        closePaymentModal();
      },
      onClose: () => {
        console.log("Payment modal closed");
      },
    });
}

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
      }}
    >
      Pay ₦{totalAmount.toLocaleString()}
    </button>
  );
};

}

export default FlutterwavePayment;