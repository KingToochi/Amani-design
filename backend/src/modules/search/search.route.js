import express from "express"
import {search} from "./search.controller.js"

const route = express.Router()
route.get("/", search)

export  default route