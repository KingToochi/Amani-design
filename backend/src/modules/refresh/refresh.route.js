import express from "express";
import { refresh } from "./refresh.controller.js";

const route = express.Router()

route.post("/", refresh)

export default route