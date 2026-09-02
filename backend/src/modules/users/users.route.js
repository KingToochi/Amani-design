import express from "express"
import {getUsername, getEmail, getUser, updateUser, getUserInfo, registration, vendorRegistration, userLogin, userLogout} from "./users.controller"
import verifyToken from "../../middleware/verifyToken"
import multer from "multer"

const route = express.Router()
const uploadImage = multer({dest: "./images"})

route.get("/", verifyToken, getUser)
route.get("/username", getUsername)
route.get("/email", getEmail)
route.get("/info", verifyToken, )
route.put("/update", verifyToken, updateUser)
route.get("/info", verifyToken, getUserInfo)
route.post("/registration", registration)
route.post("/registration/vendor",uploadImage.fields([
  {name: "profilePicture", maxCount: 1},
  {name: "proofOfAddress", maxCount: 1}
]), vendorRegistration)
route.post ("/login/admin", )

route.post("/login", userLogin)
route.post("/logout", userLogout)

export default route