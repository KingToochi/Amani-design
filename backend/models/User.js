// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fname: String,
  lname: String,
  username: String,
  email: String,
  phoneNumber: String,
  dob: String,
  bankName: String,
  accountNumber: String,
  houseNumber: String,
  streetName: String,
  city: String,
  state: String,
  shippingAddress: String,
  proofOfAddress: String,
  profilePicture: String,
  meansOfIdentification: String,
  identificationNumber: String,
  password: String,
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  role: {
    type: String,
    enum: ["user", "admin", "designer"],
    default: "user",
  },
  subscriber: {
    type: Boolean,
    default: false,
  },
  subscribtionDetails: {
    plan:{
      type: String,
      enum: ["basic", "standard", "premium"]

    },
    status: {
      type: String,
       enum: ["active", "past_due", "canceled", "trial"],
       default: "trial",
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      default: Date.now,
    },
    interval: {
      type: String,
      enum: ["monthly", "yearly"],
    }
  },
  joinedAt: Date,
});

export default mongoose.model("User", userSchema);
