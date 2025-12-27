// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fname: String,
  lname: String,
  username: String,
  email: String,
  phoneNumber: String,
  dob: String,
  address: String,
  city: String,
  state: String,
  shippingAddress: String,
  proofOfAddress: String,
  profilePicture: String,
  MeansOfIdentification: String,
  identificationNumber: String,
  password: String,
  status: String,
  joinedAt: Date,
});

export default mongoose.model("User", userSchema);
