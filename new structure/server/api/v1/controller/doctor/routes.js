import Express from "express";
import controller from "./controller";
import auth from "../../../../helper/auth";




export default Express.Router()
.post("/addDoctors",auth.verifyToken,controller.addDoctors)
.delete("/deleteDoctor",auth.verifyToken,controller.deleteDoctor)
.put("/updateDoctor",auth.verifyToken,controller.updateDoctor)


