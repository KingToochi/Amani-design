
export const validateUserUpdatedInfo = (updates) => {
    if (!updates || Object.keys(updates).length === 0) {
        throw new Error( "No data provided for update")
    }
    if (Object.keys(updates).includes("role") || Object.keys(updates).includes("status") || Object.keys(updates).includes("password") || Object.keys(updates).includes("subscription") || Object.keys(updates).includes("subscriber") || Object.keys(updates).includes("subscriptionDetails")) {
        throw new Error("Unauthorized to update certain fields")
    }
    return
}

export const userValidation = (auth)=> {
  console.log(auth)
    if (!auth._id) {
     throw new Error("Invalid authentication")
    }
    return
}

export const registrationValidation = async ({fname, lname, username, email, password, termsAndCondition, termsAccepted, acceptedTerms}) => {
    
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