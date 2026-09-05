import jwt from "jsonwebtoken";
import { getCookieOptions } from "../../utils/getCookieOptions.js";
import {generateToken} from "../../utils/generateToken.js";

export const getNewToken = async(token) => {
    const JWT_SECRET  = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, JWT_SECRET);
    
        const newAccessToken = await generateToken(decoded.email, { expiresIn: "30m" });
    
        return newAccessToken
}