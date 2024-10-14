const express = require("express");
const adminRouter  = express.Router();
adminRouter.use(express.json());
const controller = require("../controller/adminController");
const commonfunction = require("../commonfunctions/commonfunction");



adminRouter.post('/adminLogin',controller.adminLogin )   //admin login
adminRouter.post('/createShope',commonfunction.auth,controller.createShope )   //creating shopes
















module.exports = adminRouter;