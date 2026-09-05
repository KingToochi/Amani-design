import { validateRefreshToken } from "./refresh.validate.js";
import { getNewToken } from "./refresh.service.js";
export const refresh = async(req, res, next) => {
    try {
        const token = req.cookies.refreshToken;
        const validate = validateRefreshToken(token)
        const newAccessToken = await getNewToken(token)
        res.cookie("accessToken", newAccessToken, getCookieOptions(req, {
              maxAge: 30 * 60 * 1000  // 30 minutes
        }));

        
        res.json({ success: true, message: "Token refreshed" });
    }catch(error){
        next(error)
    }
}