import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import dotenv from "dotenv";
import connectDB from "./db.js"

dotenv.config();    
connectDB();
const createAdmin = async () => {
    const existingUsername = await User.findOne({ username: process.env.ADMIN_USERNAME.toLowerCase()});
    const existingEmail = await User.findOne({ email: process.env.ADMIN_EMAIL.toLowerCase() });
    if (existingUsername || existingEmail) {
        console.log("Admin user already exists");
        return;
    }

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    const adminUser = new User({
        fname: "Toochukwu",
        lname: "Umoke",
        username: process.env.ADMIN_USERNAME.toLowerCase(),
        phoneNumber: "+2349031183272",
        dob: new Date("1996-05-22"),
        email: process.env.ADMIN_EMAIL.toLowerCase(),
        password: hashedPassword,
        status: "admin",
        joinedAt: new Date(),
    });

    await adminUser.save();
    console.log("Admin user created successfully");
    mongoose.connection.close();
}

createAdmin();