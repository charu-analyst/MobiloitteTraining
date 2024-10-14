import controller from "./controller";
import express from "express";
import auth from "../../../../helper/auth"

export default express.Router()
.post("/chat",auth.verifyToken,controller.chat)