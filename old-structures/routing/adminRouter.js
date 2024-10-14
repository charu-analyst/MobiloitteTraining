const express = require("express");
const router = express.Router();
router.use(express.json());
const common = require('../commonFunction/common')


const adminController = require("../controller/adminController");




router.post("/adminLogin", adminController.adminLogin);
router.put("/adminChangePassword", adminController.adminChangePassword);

router.put("/adminForgotPassword", common.auth, adminController.adminForgotPassword);
router.post("/createShop", common.auth, adminController.createShop);
router.delete("/deleteShop/:id", common.auth, adminController.deleteShop);
router.put("/updateShop/:id", common.auth, adminController.updateShop);
router.get("/getShop/:id", common.auth, adminController.getShop);














module.exports = router;