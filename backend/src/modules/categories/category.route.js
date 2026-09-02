import express from "express"
import fetchCategory from "./category.controller.js"

const route = express.Router()

route.get("/", fetchCategory)

export default route