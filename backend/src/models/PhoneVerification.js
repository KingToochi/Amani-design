import mongoose from "mongoose";

const phoneVerificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    codeHash: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 },
    },
}, { timestamps: true });

export default mongoose.model("PhoneVerification", phoneVerificationSchema);
