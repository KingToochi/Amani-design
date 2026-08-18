import Token from "../../models/token.js";
import User from "../../models/User.js"
import crypto from "crypto";

const getToken = async (userId, recoveryToken) => {
    const hashedRecoveryToken = crypto
    .createHash("sha256")
    .update(recoveryToken)
    .digest("hex");

    const existingToken = await Token.findOne({userId});
    if (existingToken) {
        if (hashedRecoveryToken !== existingToken.hashedRecoveryToken) {
            return({message: "Invalid recovery token"});
        }
        const accessToken = existingToken.accessToken;
        const refreshAccessToken = existingToken.refreshAccessToken;
        return {message : "tokens found", accessToken, refreshAccessToken };
    }

    const existingUser = await user.findById(userId);
    if (!existingUser) {
       return({message: "User not found"});
    }

    return({message: "User exist but Token is not found"});


}

export default getToken;