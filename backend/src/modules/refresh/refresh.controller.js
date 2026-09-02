import { validateRefreshToken } from "./refresh.validate.js";
import { getNewToken } from "./refresh.service.js";
export const refresh = async(req, res, next) => {
    try {
        const token = req.cookies.refreshToken;
        const validate = validateRefreshToken(token)
        const newAccessToken = await getNewToken(token)

        
            res.json({ success: true, message: "Token refreshed", accessToken: newAccessToken });
    }catch(error){
        next(error)
    }
}