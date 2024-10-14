import Express from "express";
import controller from "./controller";
import auth from "../../../../helper/auth"


export default Express.Router()
    .post("/createHospital", auth.verifyToken, controller.createHospital)