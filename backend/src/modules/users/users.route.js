import express from "express"
import {getUsername, getEmail, getUser, updateUser, getUserInfo, registration, vendorRegistration, userLogin, userLogout, verifyEmail, sendPhoneVerificationCode, verifyPhoneCode} from "./users.controller.js"
import verifyToken from "../../middleware/verifyToken.js"
import multer from "multer"

const route = express.Router()
const uploadImage = multer({dest: "./images"})

route.get("/", verifyToken, getUser)
route.post("/username", getUsername)
route.post("/email", getEmail)
route.get("/verify-email", verifyEmail)
route.post("/phone/send-code", verifyToken, sendPhoneVerificationCode)
route.post("/phone/verify-code", verifyToken, verifyPhoneCode)
route.put("/update", verifyToken, updateUser)
route.get("/info", verifyToken, getUserInfo)
route.post("/registration", registration)
route.post("/registration/vendor",uploadImage.fields([
  {name: "profilePicture", maxCount: 1},
  {name: "proofOfAddress", maxCount: 1}
]), vendorRegistration)


route.post("/login", userLogin)
route.post("/logout", userLogout)

export default route