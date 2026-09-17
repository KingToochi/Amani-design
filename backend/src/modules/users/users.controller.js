import { fetchUsername, fetchEmail, fetchUser, registerVendor, registerUser, loginUser, logUserOut} from "./users.service.js";
import { validateUserUpdatedInfo, userValidation, registrationValidation, validateVendorRegistration, validateLoginData } from "./users.validation.js";
import { parseBooleanFlag } from "../../utils/booleanFlag.js"
import { getCookieOptions } from "../../utils/getCookieOptions.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import PhoneVerification from "../../models/PhoneVerification.js";
import { sendRegistrationEmails } from "../../integrations/email/email.service.js";

export const getUsername = async(req, res, next) => {
    try {
        const {username} = req.body
        const user = await fetchUsername(username)
        if (!user) return res.json({ status: "free", message: "Username available" });
        res.json({ status: "exists", message: "Username already taken" });
    } catch(error){
        next(error)
    }
}

export const getEmail = async(req, res, next) => {
    try {
        const {email} = req.body
        const user = await fetchEmail(email)
        if (!user) return res.json({ status: "free", message: "Email available" });
        res.json({ status: "exists", message: "This email has been used" });
    } catch(error){
        next(error)
    }
}

export const getUser = async(req, res, next)=> {
    try{
        const auth = req.user
        const user = await fetchUser(auth)
        if (user) {
            const userDetails = {
                lname: user.lname,  
                fname: user.fname,  
                profilePicture: user.profilePicture,
                username: user.username,
                role: user.role,
                email: user.email,
                phoneNumber: user.phoneNumber,
                typeOfVendor: user.typeOfVendor
            }

            return res.status(200).json({success:true, message: "user details found", userData: userDetails})
        } else {
            console.log("i didnt found the user")
            return res.status(404).json({success:false, message:"user details not found"})
        }

    }catch(error){
        next(error)
    }
}

export const updateUser = async(req, res, next) => {
    try {
        const auth = req.user
        const updates = req.body
        const userId = auth._id

        await validateUserUpdatedInfo({updates, userId})
        const user = await fetchUser(auth)
        if (!user) {
            return res.status(404).json({success: false, message: "User not found" })
        }
        // Update user fields
        Object.keys(updates).forEach(key => {
            if (key !== "_id") {
                user[key] = updates[key]
            }
            if(key === "email") {
                user.emailVerified = false
            }
            if(key === "phoneNumber") {
                user.phoneNumberVerified = false
            }
        })

        await user.save()
        return res.json({ success: true, message: "User information updated successfully", user})

    } catch(error){
        next(error)
    }
}

export const getUserInfo = async(req, res, next) => {
try {
    const auth = req.user
    const validate = userValidation(auth)
    const user = await fetchUser(auth)
    //  Explicitly define which fields to return
    const userInfo = {
      fname: user.fname,
      lname: user.lname,
      email: user.email,
      shippingAddress: user.shippingAddress,
      phoneNumber: user.phoneNumber,
      dob: user.dob,
      city: user.city,
      state: user.state,
      profilePicture: user.profilePicture,
      username: user.username,
      role: user.role,
      typeOfVendor: user.typeOfVendor,
      status: user.status,
      subscriber: user.subscriber,
      phoneNumberVerified: user.phoneNumberVerified,
      emailVerified: user.emailVerified,
      deliveryCompany: user?.deliveryCompany,
      subscriptionPlan: user?.subscriptionDetails?.plan,
      subscriptionStatus: user?.subscriptionDetails?.status,
      subscriptionStartDate: user?.subscriptionDetails?.startDate,
      subscriptionExpiryDate: user?.subscriptionDetails?.expiryDate,
      joinedAt: user?.joinedAt,
      // Add any other non-sensitive fields here
    }
    
    return res.json({success: true, user: userInfo})

} catch(error){
    next(error)
}
}

export const registration = async(req, res, next) => {
    try {
        const { fname, lname, username, email, password, termsAndCondition, termsAccepted, deliveryRoute } = req.body;
        const acceptedTerms = parseBooleanFlag(termsAndCondition ?? termsAccepted);
        const validateData = await registrationValidation({fname, lname, username, email, password, termsAndCondition, termsAccepted, acceptedTerms, deliveryRoute})
        const exists = validateData
        const saveUser = await registerUser({exists, fname, lname, username, email, password, termsAndCondition, termsAccepted, acceptedTerms, deliveryRoute})
        const {accessToken, refreshToken, user} = saveUser
        await sendRegistrationEmails({
            email: user.email,
            firstName: user.fname,
            verificationUrl: `${req.protocol}://${req.get("host")}/users/verify-email?token=${jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" })}`,
        })

        // Set access token in HTTP-only cookie
        res.cookie("accessToken", accessToken, getCookieOptions(req, {
            maxAge: 30 * 60 * 1000  // 30 minutes
        }));
    
        // Set refresh token in HTTP-only cookie
        res.cookie("refreshToken", refreshToken, getCookieOptions(req, {
            path: "/refresh",
            maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
        }));
        res.status(201).json({ success: true, message: "User registered successfully"});
    }catch(error) {
        next(error)
    }
}

export const vendorRegistration = async(req, res, next) => {
    try {
        const {fname, lname, email, phoneNumber, username, dob, password, houseNumber, streetName, meansOfIdentification, typeOfVendor, bankName, accountNumber, identificationNumber, city, state, termsAndCondition, termsAccepted} = req.body
        const acceptedTerms = parseBooleanFlag(termsAndCondition ?? termsAccepted);
        const validate = await validateVendorRegistration({fname, lname, email, phoneNumber, username, dob, password, houseNumber, streetName, meansOfIdentification, typeOfVendor, bankName, accountNumber, identificationNumber, city, state, termsAndCondition, termsAccepted, acceptedTerms})
        const exists = validate
        const saveUser = await registerVendor({req, exists, fname, lname, email, phoneNumber, username, dob, password, houseNumber, streetName, meansOfIdentification, typeOfVendor, bankName, accountNumber, identificationNumber, city, state, termsAndCondition, termsAccepted, acceptedTerms})
        const {accessToken, refreshToken, user} = saveUser
        await sendRegistrationEmails({
            email: user.email,
            firstName: user.fname,
            verificationUrl: `${req.protocol}://${req.get("host")}/users/verify-email?token=${jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" })}`,
        })

        // Set access token in HTTP-only cookie
        res.cookie("accessToken", accessToken, getCookieOptions(req, {
        maxAge: 30 * 60 * 1000  // 30 minutes
        }));

        // Set refresh token in HTTP-only cookie
        res.cookie("refreshToken", refreshToken, getCookieOptions(req, {
        path: "/refresh",
        maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
        }));
        res.status(201).json({ success: true,  message: "User registered successfully" });
        
    }catch(error){
            next(error)
        }
}

export const verifyEmail = async(req, res, next) => {
    try {
        const decoded = jwt.verify(req.query.token, process.env.JWT_SECRET)
        const user = await fetchUser({ _id: decoded._id })

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        user.emailVerified = true
        await user.save()
        return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}/profile`)
    } catch(error) {
        next(error)
    }
}

export const sendPhoneVerificationCode = async(req, res, next) => {
    try {
        const user = await fetchUser(req.user)
        const phoneNumber = String(req.body.phoneNumber || user?.phoneNumber || "").trim()

        if (!user || !phoneNumber) {
            return res.status(400).json({ success: false, message: "A phone number is required" })
        }
        if (!process.env.TERMII_API_KEY) {
            return res.status(503).json({ success: false, message: "Phone verification is not configured" })
        }

        const code = crypto.randomInt(100000, 1000000).toString()
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

        await PhoneVerification.findOneAndUpdate(
            { userId: user._id },
            { phoneNumber, codeHash: crypto.createHash("sha256").update(code).digest("hex"), expiresAt },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        )

        const smsResponse = await fetch("https://api.ng.termii.com/api/sms/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                api_key: process.env.TERMII_API_KEY,
                to: phoneNumber,
                from: process.env.TERMII_SENDER_ID || "AmaniSky",
                sms: `Your AmaniSky verification code is ${code}. It expires in 10 minutes.`,
                type: "plain",
                channel: "generic",
            }),
        })

        if (!smsResponse.ok) {
            await PhoneVerification.deleteOne({ userId: user._id })
            return res.status(502).json({ success: false, message: "Unable to send verification code" })
        }

        return res.json({ success: true, message: "Verification code sent" })
    } catch(error) {
        next(error)
    }
}

export const verifyPhoneCode = async(req, res, next) => {
    try {
        const code = String(req.body.code || "").trim()
        const user = await fetchUser(req.user)
        const verification = await PhoneVerification.findOne({ userId: user?._id })

        if (!user || !verification || verification.expiresAt < new Date()) {
            return res.status(400).json({ success: false, message: "This verification code has expired" })
        }

        const codeHash = crypto.createHash("sha256").update(code).digest("hex")
        if (codeHash !== verification.codeHash) {
            return res.status(400).json({ success: false, message: "Invalid verification code" })
        }

        user.phoneNumber = verification.phoneNumber
        user.phoneNumberVerified = true
        await user.save()
        await PhoneVerification.deleteOne({ userId: user._id })

        return res.json({ success: true, message: "Phone number verified" })
    } catch(error) {
        next(error)
    }
}

export const userLogin = async(req, res, next) => {
    try{
        const { email, password } = req.body;
        const validate = validateLoginData({email, password})
        const login = await loginUser({email, password})
        const { accessToken, refreshToken, user } = login;
         // Set access token in HTTP-only cookie
        res.cookie("accessToken", accessToken, getCookieOptions(req, {
            maxAge: 30 * 60 * 1000  // 30 minutes
        }));
    
        // Set refresh token in HTTP-only cookie
        res.cookie("refreshToken", refreshToken, getCookieOptions(req, {
            path: "/refresh",
            maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
        }));
        

       return res.json({ success: true, message: "User login successful"});
    }catch(error) {
        next(error)
    }
}

export const userLogout = async(req, res, next) => {
    try {
        const logout = await logUserOut({req, res})
        res.json({ success: true, message: "Logged out successfully" });
    }catch(error) {
        next(error)
    }
}
