// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fname: String,
  lname: String,
  username: String,
  email: String,
  proofOfAddress: String,
  profilePicture: String,
  MeansOfIdentification: String,
  password: String,
  status: String,
  joinedAt: Date,
});

export default mongoose.model("User", userSchema);
