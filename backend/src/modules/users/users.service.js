import User from "../../models/User"
import bcrypt from "bcryptjs";
import {generateToken} from "../../utils/generateToken"
import { getCookieOptions } from "../../utils/getCookieOptions";


export const fetchUsername = async(username) => {
    const user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      throw new Error("User does not exist")
    }
    return user
}

export const fetchEmail = async(email) => {
    const user = await User.findOne({email: email.toLowerCase()})
    return user
}

export const fetchUser = async(auth) => {
    const user = await User.findOne({_id : auth._id})
    return user
}

export const registerUser = async(exists) => {
    if (exists) return res.status(400).json({success: false, message: "Email or username already exists" });

        const mainUsername = username.toLowerCase()
        const mainEmail = email.toLowerCase()
        let hashedPassword = await bcrypt.hash(password, 10)
        const newUser = new User({
            joinedAt: new Date().toISOString(),
            fname,
            lname,
            username : mainUsername.trim(),
            email : mainEmail.trim(),
            phoneNumber: "",
            dob: "",
            profilePicture: "",
            password: hashedPassword,
            termsAndCondition: acceptedTerms,
            status: "approved",
            role: "user",
        });
    
        await newUser.save();
        const accessToken = await generateToken(mainEmail, { expiresIn: "30m" })
        const refreshToken = await generateToken(mainEmail, { expiresIn: "7d" })
        //  const hashedRecoveryToken = crypto.createHash("sha256").update(recoveryToken).digest("hex");
    
        // Set access token in HTTP-only cookie
        res.cookie("accessToken", accessToken, getCookieOptions(req, {
            maxAge: 30 * 60 * 1000  // 30 minutes
        }));
    
        // Set refresh token in HTTP-only cookie
        res.cookie("refreshToken", refreshToken, getCookieOptions(req, {
            path: "/refresh",
            maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
        }));

        return success
    
}

export const registerVendor = async(exists) => {
    if (exists) {
      throw new Error("Email or username already exists")
    }
    const mainUsername = username.toLowerCase()
    const mainEmail = email.toLowerCase()
    
    let profilePictureUrl = ""
    let proofOfAddressUrl = ""
    let hashedPassword = await bcrypt.hash(password, 10)
    
    if (req.files.profilePicture) {
      const cloudRes = await cloudinary.uploader.upload(req.files.profilePicture[0].path, {
        folder: "my_website_users"
      })
      profilePictureUrl = cloudRes.secure_url;
      fs.unlink(req.files.profilePicture[0].path, () => {});
      console.log(profilePictureUrl)
    }
    if (req.files.proofOfAddress) {
            const cloudRes = await cloudinary.uploader.upload(req.files.proofOfAddress[0].path, {
              folder: "my_website_users",
            });
            proofOfAddressUrl = cloudRes.secure_url;
            fs.unlink(req.files.proofOfAddress[0].path, () => {});
            console.log(proofOfAddressUrl)
          }
           const newUser = new User({
            fname,
            lname,
            email : mainEmail.trim(),
            username : mainUsername.trim(),
            phoneNumber,
            dob,
            password: hashedPassword,
            houseNumber,
            streetName,
            typeOfVendor,
            bankName,
            accountNumber,
            meansOfIdentification,
            identificationNumber,
            profilePicture: profilePictureUrl,
            proofOfAddress: proofOfAddressUrl,
            city,
            state,
            country: "Nigeria",
            shippingAddress: `${houseNumber} ${streetName}, ${city}, ${state}`,
            termsAndCondition: acceptedTerms,
            role: "vendor",
          });
          await newUser.save();
          const accessToken = await generateToken(mainEmail, { expiresIn: "30m" })
          const refreshToken = await generateToken(mainEmail, { expiresIn: "7d" })
    
    
    
          // Set access token in HTTP-only cookie
          res.cookie("accessToken", accessToken, getCookieOptions(req, {
            maxAge: 30 * 60 * 1000  // 30 minutes
          }));
    
          // Set refresh token in HTTP-only cookie
          res.cookie("refreshToken", refreshToken, getCookieOptions(req, {
            path: "/refresh",
            maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
          }));
    
         return success
}

export const loginUser = async({email, password}) => {
    const loginIdentifier = String(email).trim().toLowerCase();
        const user = await User.findOne({ $or: [{ email: loginIdentifier }, { username: loginIdentifier }] });
        if (!user) throw new Error("User not found")
        if(user.role !== "user" && user.role !== "vendor") throw new error( "Access denied")
        const hashedPassword = user.password
        const ismatch = bcrypt.compare(password, hashedPassword)
        if (!ismatch)  throw new Error("Incorrect password")
    
        const accessToken = await generateToken(loginIdentifier, { expiresIn: "30m" })
        const refreshToken = await generateToken(loginIdentifier, { expiresIn: "7d" })
        
        // Set access token in HTTP-only cookie
        res.cookie("accessToken", accessToken, getCookieOptions(req, {
          maxAge: 30 * 60 * 1000  // 30 minutes
        }));
    
        // Set refresh token in HTTP-only cookie
        res.cookie("refreshToken", refreshToken, getCookieOptions(req, {
          path: "/refresh",
          maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
        }));

        return success
    
}

export const logUserOut = () => {
    // Clear HTTP-only cookies
  res.clearCookie("accessToken", getCookieOptions(req));

  res.clearCookie("refreshToken", getCookieOptions(req, {
    path: "/refresh"
  }));

  return success

}

export const loginAdmin = async({email, password}) => {
   const loginIdentifier = String(email).trim().toLowerCase();
      const user = await User.findOne({ $or: [{ email: loginIdentifier }, { username: loginIdentifier }] });
      if (!user) return res.status(404).json({ success: false, message: "User not found" });
      const hashedPassword = user.password
      console.log(hashedPassword)
      console.log(password)
      console.log(user)
      const ismatch = bcrypt.compare(password, hashedPassword)
      if (!ismatch) return res.status(401).json({ success: false, message: "Incorrect password" });
      if (user.role !== "admin") return res.status(403).json({ success: false, message: "Access denied" });
  
      const accessToken = await generateToken(loginIdentifier, { expiresIn: "15m" })
      const refreshToken = await generateToken(loginIdentifier, { expiresIn: "7d" })
  
      // Set access token in HTTP-only cookie
      res.cookie("accessToken", accessToken, getCookieOptions(req, {
        maxAge: 15 * 60 * 1000  // 15 minutes
      }));
  
      // Set refresh token in HTTP-only cookie
      res.cookie("refreshToken", refreshToken, getCookieOptions(req, {
        path: "/refresh",
        maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days
      }));
}