const express = require("express");
const staticRouter = express.Router();
staticRouter.use(express.json())


const controller = require("../controller/staticController");


staticRouter.put("/editDiscription" ,  controller.edit_discription)










module.exports = staticRouter;