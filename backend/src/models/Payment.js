import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema( {
    reference : {
        type : String,
        required: true,
    },
    acessCode : {
        type : String,
        required: true,
    },
    purpose : {
        type : String,
        required: true,
    },
    amount : {
        type : Number,
        required: true,
    },
    planName : {
        type : String,
    },
    status : {
        type : String,
        enum: ["pending","successful", "failed", "reversed", "cancelled", "otp_required", "otp_verified", "otp_invalid", "otp_expired", "otp_not_sent", "otp_not_required"],
        default: "pending",
    },
    transferCode : String,
    recipientCode : String,
    transferDate : Date,
    relatedOrderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
    },
    orderItemId: mongoose.Schema.Types.ObjectId,
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.model("Payment", paymentSchema);