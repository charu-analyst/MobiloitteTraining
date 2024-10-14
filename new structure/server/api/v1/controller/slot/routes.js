

import Express from "express";
import controller from "./controller";
import auth from "../../../../helper/auth"


export default Express.Router()
.post("/slotCreation",auth.verifyToken,controller.slotCreation)














