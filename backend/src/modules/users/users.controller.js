import { fetchUsername, fetchEmail, fetchUser, registerVendor, registerUser, loginUser, logUserOut} from "./users.service.js";
import { validateUserUpdatedInfo, userValidation, registrationValidation, validateVendorRegistration, validateLoginData } from "./users.validation.js";
import { parseBooleanFlag } from "../../utils/booleanFlag.js"

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

        const validateData = await validateUserUpdatedInfo(updates)
        const user = await fetchUser(auth)
        if (!user) {
            return res.status(404).json({success: false, message: "User not found" })
        }
        // Update user fields
        Object.keys(updates).forEach(key => {
            if (key !== "_id") {
                user[key] = updates[key]
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
    const auth = req.body
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
      subscriptionPlan: user?.subscriptionDetails?.plan,
      subscriptionStatus: user?.subscriptionDetails?.status,
      subscriptionStartDate: user?.subscriptionDetails?.startDate,
      subscriptionExpiryDate: user?.subscriptionDetails?.expiryDate,
      // Add any other non-sensitive fields here
    }
    
    return res.json({success: true, user: userInfo})

} catch(error){
    next(error)
}
}

export const registration = async(req, res, next) => {
    try {
        const { fname, lname, username, email, password, termsAndCondition, termsAccepted } = req.body;
        const acceptedTerms = parseBooleanFlag(termsAndCondition ?? termsAccepted);
        const validateData = await registrationValidation({fname, lname, username, email, password, termsAndCondition, termsAccepted, acceptedTerms})
        const exists = validateData
        const saveUser = await registerUser(exists)
        if (saveUser === "success") {
            res.status(201).json({ success: true, message: "User registered successfully"});
        } 
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
        const saveUser = await registerVendor(exists)
        if (saveUser === "success") {
            res.status(201).json({ success: true,  message: "User registered successfully" });
        } 
        
    }catch(error){
            next(error)
        }
}

export const userLogin = async(req, res, next) => {
    try{
        const { email, password } = req.body;
        const validate = validateLoginData({email, password})
        const login = await loginUser({email, password})

        if (login === "success") res.json({ success: true, message: "User login successful"});
    }catch(error) {
        next(error)
    }
}

export const userLogout = async(req, res, next) => {
    try {
        const logout = await logUserOut()
        res.json({ success: true, message: "Logged out successfully" });
    }catch(error) {
        next(error)
    }
}
