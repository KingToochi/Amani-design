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
        enum: ["pending","successful", "failed"],
        default: "pending",
    },
    createdAt: {
    type: Date,
    default: Date.now,
  },
})

export default mongoose.model("Payment", paymentSchema);