// routes/verifyPayment.js
import axios from "axios"
import Order from "../models/Order";

const verifyPayment = async (req, res) => {
  try {
    const { transaction_id, amount, customer_email, cart_items } = req.body;

    // Validate input
    if (!transaction_id) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID is required",
      });
    }

    // Check if already verified
    const existingOrder = await Order.findOne({ transactionId: transaction_id });
    if (existingOrder) {
      return res.json({
        success: true,
        message: "Payment already verified",
        data: { orderId: existingOrder._id },
      });
    }

    // Verify with Flutterwave
    const response = await axios({
      method: "get",
      url: `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      headers: {
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      },
    });

    const verification = response.data;

    // Check verification status
    if (verification.status === "success" && 
        verification.data.status === "successful") {
      
      // Verify amount matches
      if (verification.data.amount !== amount) {
        return res.status(400).json({
          success: false,
          message: "Amount mismatch",
        });
      }

      // Create order in database
      const order = new Order({
        orderNumber: `ORD-${Date.now()}`,
        transactionId: transaction_id,
        amount: verification.data.amount,
        customerEmail: customer_email,
        customerName: verification.data.customer.name,
        customerPhone: verification.data.customer.phone_number,
        items: cart_items || [],
      });

      await order.save();

      return res.json({
        success: true,
        message: "Payment verified successfully",
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }
  } catch (error) {
    console.error("Verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during verification",
    });
  }
};
export default verifyPayment;