import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import dotenv from "dotenv";

dotenv.config();    
const createAdmin = async () => {
    await mongoose.connect("mongodb://localhost:27017/amani");
    const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (existingAdmin) {
        console.log("Admin user already exists");
        return;
    }

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
    const adminUser = new User({
        fname: "Toochukwu",
        lname: "Umoke",
        username: "KingTheAdmin",
        phoneNumber: "+2349031183272",
        dob: new Date("1990-01-01"),
        email: process.env.ADMIN_EMAIL,
        password: hashedPassword,
        status: "admin",
        joinedAt: new Date(),
    });

    await adminUser.save();
    console.log("Admin user created successfully");
    mongoose.connection.close();
}

createAdmin();