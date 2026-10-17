
import crypto from "crypto";
import axios from "axios";
import User from "../../models/User"

export const paystackWebhook = async (req, res) => {
  const signature = req.headers["x-paystack-signature"];

  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(req.rawBody)
    .digest("hex");

  // Validate that Paystack sent this request.
  if (
    !signature ||
    !crypto.timingSafeEqual(
      Buffer.from(hash, "hex"),
      Buffer.from(signature, "hex")
    )
  ) {
    return res.status(401).send("Invalid signature");
  }

  // Acknowledge the webhook after signature validation.
  res.sendStatus(200);

  try {
    const { event, data } = req.body;

    console.log("Paystack event:", event);

    switch (event) {
      case "subscription.create":
        console.log("Subscription created:", data.subscription_code);
        // Save the Paystack subscription details.
        break;

      case "charge.success":
        console.log("Payment successful:", data.reference);
        // Verify payment details against your pending payment record.
        const response = await axios({
            url: `https://api.paystack.co/transaction/verify/${data.reference}`,
            method: "GET",

            headers: {
                Authorization:
                    `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            },
        });

        const payment = response.data.data;

        if (payment.status === "success" || payment.data.status === "success") {
            console.log("Payment verified successfully:", payment);
            const userEmail = payment.customer.email;

            const user = await User.findOne({email : userEmail}).lean()
            

            // Activate or renew the vendor's subscription.
        }

        // Activate or renew the vendor's subscription.
        break;

      case "invoice.payment_failed":
        console.log("Subscription payment failed:", data);
        // Record failed payment and apply your billing policy.
        break;

      case "invoice.update":
        console.log("Invoice updated:", data);
        // Reconcile invoice status.
        break;

      case "subscription.not_renew":
        console.log("Subscription will not renew:", data);
        // Record the non-renewal.
        break;

      case "subscription.disable":
        console.log("Subscription disabled:", data);
        // Update the subscription status in MongoDB.
        break;

      default:
        console.log("Unhandled Paystack event:", event);
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
    // Log for retry/reconciliation: the HTTP response was already sent.
  }
};