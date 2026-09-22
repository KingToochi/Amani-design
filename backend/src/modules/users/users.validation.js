import User from "../../models/User.js";
import { fetchEmail } from "./users.service.js";
import { fetchUsername } from "./users.service.js";

export const validateUserUpdatedInfo = async ({updates, userId}) => {
    if (!updates || Object.keys(updates).length === 0) {
        throw new Error("No data provided for update");
    }

    const hasEmptyField = Object.values(updates).some(
      (value) => value === null || value === undefined || (typeof value === "string" && !value.trim())
    );

    if (hasEmptyField) {
      throw new Error("All update fields are required");
    }

    const restrictedFields = [
        "role",
        "status",
        "phoneNumberVerified",
        "emailVerified",
        "password",
        "subscription",
        "subscriber",
        "subscriptionDetails",
    ];

    const hasRestrictedField = Object.keys(updates).some(
        (field) => restrictedFields.includes(field)
    );

    if (hasRestrictedField) {
        throw new Error("Unauthorized to update certain fields");
    }

    if (updates.email) {
        const currentEmail = await User.findById(userId).select("emailVerified")
        if(currentEmail && currentEmail.emailVerified === "verified") {
          throw new Error("This email cannot be changed")
        }
        const user = await fetchEmail(updates.email);

        if (user && user._id.toString() !== userId.toString()) {
            throw new Error("This email has been used");
        }
    }

    if (updates.username) {
        const user = await fetchUsername(updates.username);

        if (user &&  user._id.toString() !== userId.toString()) {
            throw new Error("This username has been used");
        }
    }

    return true;
};
export const userValidation = (auth)=> {
  console.log(auth)
    if (!auth._id) {
     throw new Error("Invalid authentication")
    }
    return auth
}

export const registrationValidation = async ({fname, lname, username, email, password, termsAndCondition, termsAccepted, acceptedTerms, deliveryRoute}) => {
    
    if (!fname || !lname || !username || !email || !password) {
      throw new Error("All fields are required")                                                    
    }
    if (!acceptedTerms) {
      throw new Error ("You must accept the terms and conditions")
    }
    const exists = await User.findOne({
      $or: [
        { email: new RegExp(`^${email}$`, "i") },
        { username: new RegExp(`^${username}$`, "i") },
      ],
    });

        return exists
}

export const validateVendorRegistration = async({fname, lname, email, phoneNumber, username, dob, password, houseNumber, streetName, meansOfIdentification, typeOfVendor, bankName, accountNumber, identificationNumber, city, state, termsAndCondition, termsAccepted, acceptedTerms}) => {
    if (!fname || !lname || !email || !phoneNumber || !dob || !houseNumber || !streetName || !meansOfIdentification || !typeOfVendor || !bankName || !accountNumber || !identificationNumber || !city || !state ) {
      throw new Error( "All fields required")
    }
    
    if (!acceptedTerms) {
      throw new Error("You must accept the terms and conditions" )
    }
    
    const exists = await User.findOne({
      $or: [
        { email: new RegExp(`^${email}$`, "i") },
        { username: new RegExp(`^${username}$`, "i") },
      ],
    });

    return exists
}

export const validateLoginData = ({email, password}) => {
    if (!email || !password) {
      throw new Error("Email and password are required")
    }

    return
}