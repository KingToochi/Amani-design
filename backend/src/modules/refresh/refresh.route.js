import express from "express";
import { refresh } from "./refresh.controller";

const route = express.Router()

route.post("/", refresh)

export default route