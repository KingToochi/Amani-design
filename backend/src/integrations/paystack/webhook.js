
import crypto from "crypto";
import axios from "axios";
import User from "../../models/User.js"
import verifyPaystackPayment from "./verify.js"
import Payment from "../../models/Payment.js"

export const paystackWebhook = async (req, res) => {
  console.log("Received Paystack webhook:", req.body);
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

    console.log("Paystack event:", event, data);

    switch (event) {
    case "charge.success": {
      const reference = data.reference;
      console.log("i have switch to success")

      if (!reference) {
        console.log("no reference")
        throw new Error("Payment reference is missing");
      }

      const verifiedPayment = await verifyPaystackPayment(reference);
      const payment = verifiedPayment.payment;
      let paymentModel = verifiedPayment.paymentModel;

      // Confirm the actual transaction succeeded.
      if (payment.status !== "success") {
         console.log("not successful")
        throw new Error("Payment was not successful");
      }

      // Make sure the verified reference matches the webhook.
      if (payment.reference !== reference) {
         console.log("reference not equal")
        throw new Error("Payment reference mismatch");
      }

      if (payment.currency !== "NGN") {
         console.log("wrong currency")
        throw new Error("Invalid payment currency");
      }

      // Avoid processing an already completed payment twice.
      if (paymentModel?.status === "successful") {
         console.log("payment is already successful")
        break;
      }

      const purpose = payment.metadata?.purpose;

      if (!purpose) {
         console.log("no purpose")
        throw new Error("Payment purpose is missing");
      }

      // Validate the payment against your own pending payment record.
      if (!paymentModel) {
         console.log("no paymentmodel")
        throw new Error("No matching payment record exists");
      }

      if (Number(paymentModel.amount) !== Number(payment.requested_amount) / 100) {
         console.log("amount not equal")
        throw new Error("Payment amount mismatch");
      }

      if (paymentModel.purpose !== purpose) {
         console.log("purpose not equal")
        throw new Error("Payment purpose mismatch");
      }

      console.log("purpose", purpose)
      console.log("paymentModel", paymentModel)

      if (purpose.toLowerCase() === "subscription payment") {
         console.log("everything good")
        const planName = payment.metadata?.planName;

        const plans = {
          basic: 200000,
          standard: 300000,
          premium: 500000,
        };

        if (!planName || Number(payment.requested_amount) !== plans[planName]) {
          throw new Error("Invalid subscription plan or amount");
        }

        const userEmail = payment.customer?.email;

        const user = await User.findOne({ email: userEmail })
          .select("role subscriber subscriptionDetails");

        if (!user || user.role !== "vendor") {
          throw new Error("Vendor account not found");
        }

        const now = new Date();
        const currentExpiry = user.subscriptionDetails?.expiryDate;

        // Extend an existing active subscription rather than
        // accidentally shortening its remaining time.
        const startDate =
          user.subscriptionDetails?.status === "active" &&
          user.subscriptionDetails?.plan === planName &&
          currentExpiry &&
          new Date(currentExpiry) > now
            ? new Date(currentExpiry)
            : now;

        const expiryDate = new Date(startDate);
        expiryDate.setMonth(expiryDate.getMonth() + 1);

        user.subscriber = true;
        user.subscriptionDetails = {
          plan: planName,
          status: "active",
          startDate: now,
          expiryDate,
          interval: "monthly",
        };
        console.log(user)

        await user.save();
      }

      paymentModel.status = "successful";
      await paymentModel.save();

      break;
    }

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