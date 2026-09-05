import { fetchUser } from "../users/users.service.js"
import Likes from "../../models/Likes.js"

export const postLike = async(req, res, next) => {
    try {
        const auth = req.user
        const {productId} = req.body
        const user = await fetchUser(auth)
        if (user) {
            const exist = await Likes.findOne({userId: auth._id, productId: productId })
            if (exist) {
                await Likes.deleteOne({userId: auth._id, productId: productId }) 
                res.json({status: "success", message: "product deleted "})
                return
            } else {
                const newLike = new Likes ({
                userId : auth._id,
                productId: productId
                })
                await newLike.save()
                return res.json({status: "success", message: "product Liked"})
            }
            }
    }catch(error) {
        next(error)
    }
}

export const getLikes =async(req, res, next) => {
    try {
        const auth = req.user
        const user = await fetchUser(auth) 
    
      if (!user) {
        return res.json({success:false, message:"user do not exist"})
      }
        const likedProducts = await Likes.find({userId : auth._id})
        return res.json({success: true, likedProducts})
    } catch(error){
        next(error)
      }
}