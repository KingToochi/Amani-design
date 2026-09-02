import jwt from "jsonwebtoken";
import { getCookieOptions } from "../../utils/getCookieOptions.js";

export const getNewToken = async(token) => {
    const JWT_SECRET  = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, JWT_SECRET);
    
        const newAccessToken = await generateToken(decoded.email, { expiresIn: "30m" });
        res.cookie("accessToken", newAccessToken, getCookieOptions(req, {
              maxAge: 30 * 60 * 1000  // 30 minutes
        }));
        return newAccessToken
}