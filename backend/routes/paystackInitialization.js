import axios from "axios"
import calculateAmount from "components/calculateAmount"

const paystackInitialization = async (email, cart) => {
    

  try {
        if (!email){
            throw new Error("Email is required");
            return;
        }
        if(!cart || !Array.isArray(cart) || cart.length === 0){
            throw new Error("Cart is required and must be a non-empty array");
            return;
        }
        const calculatedAmount = calculateAmount(cart);
        if (!Number.isFinite(calculatedAmount) || calculatedAmount <= 0) {
        throw new Error("A valid amount is required");
        return
    }
    console.log("Calculated amount:", calculatedAmount);
        const nairaToKobo = Math.round(Number(calculatedAmount) * 100);
        const amount = nairaToKobo.toString();
        console.log("Calculated amount in kobo:", amount);
        if (!amount){
            throw new Error("Amount is required");
            return;
        }

      const response = await axios({
        url : "https://api.paystack.co/transaction/initialize",
        method : "POST",
        headers : {
            authorization : `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            "Content-Type" : "application/json",
        },
        data : {
            email : email,
            amount : amount,
            callBack :  `${process.env.FRONTEND_URL}/payment/callback`
        }
    })
        console.log("Paystack initialization response:", JSON.stringify(response.data, null, 2));
      return response.data
  }
  catch (error) {
    console.error(
      "Paystack initialization error:",
      error.response?.data || error.message
    );

        throw new Error(
            error.response?.data?.message ||
            "Unable to initialize Paystack transaction"
        );
  }
}