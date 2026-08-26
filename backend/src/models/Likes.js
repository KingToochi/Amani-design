import mongoose from "mongoose";

const LikesSchema = new mongoose.Schema({
    productId : {
        type: mongoose.Schema.Types.ObjectId,
        ref : "Product",
        required: true
    },
    userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, { timestamps: true })

export default mongoose.model("Likes", LikesSchema);