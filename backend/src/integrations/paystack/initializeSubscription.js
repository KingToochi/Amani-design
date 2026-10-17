import User from "../../models/User.js";
import axios from "axios";
const initializeSubscription = async(req) => {
    try {
        const user = req.user;
        const {planAmount, planName} = req.body;

        if (!planAmount || !planName) {
            throw new Error("Plan amount and plan name are required");
        }
        
        if(!user) {
            throw new Error("User not found");
        }
        if(user.role !== "vendor") {
            throw new Error("Only vendors can initialize a subscription");
        }

        const userEmail = await User.findOne({
            _id: user._id
        }).select("email").exec();

         if(!userEmail?.email) {
            throw new Error("User email not found");
        }

        const email = userEmail.email;


        let plan;

        if (planName.toLowerCase() === "basic" && Number(planAmount) === 2000) {plan = process.env.PAYSTACK_BASIC_PLAN_CODE;}
        else if (planName.toLowerCase() === "standard" && Number(planAmount) === 3000) {plan = process.env.PAYSTACK_STANDARD_PLAN_CODE;}
        else if (planName.toLowerCase() === "premium" && Number(planAmount) === 5000) {plan = process.env.PAYSTACK_PREMIUM_PLAN_CODE;}
        else throw new Error("Invalid plan or amount");

        const amount = Number(planAmount) * 100; // Convert to kobo

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
                plan :  plan,
            }
        })

        console.log("Paystack subscription initialization response:", JSON.stringify(response.data, null, 2));
        return response.data
    }catch(error){
        console.error(
        "Paystack subscription initialization error:",
        error.response?.data || error.message
        );

            throw new Error(
                error.response?.data?.message ||
                "Unable to initialize Paystack transaction"
            );
        }

}

export default initializeSubscription