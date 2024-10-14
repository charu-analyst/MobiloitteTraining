const express = require("express");
const router = express.Router();
router.use(express.json())
const controller = require("../controller/controller");
const jwt = require("../commonfunctions/commonfunction");




router.post('/signup', controller.signup) //signup api
router.put("/otpVerification", controller.otpVerification)  //otp verification
router.put("/reSendOtp", controller.reSendOtp)  //otp verification

router.post('/login', controller.Login)  //login api
router.get('/getUser', jwt.auth, controller.getUser) //geting user's data
router.put('/updateUser', jwt.auth, controller.updateUser)   //edit profile(firstName,lastName)
router.post('/editUser', jwt.auth, controller.editUser)   //edit profile (email,number)
router.get('/emailVerification/:_id', controller.emailVerification)   //edit profile (email) verification
const path = require("path");  //path module to find out the path of the static file
// console.log(__dirname, "../static")
const staticpath = path.join(__dirname, "../static");
router.use(express.static(staticpath)) //static content api
router.post("/fileUpload", controller.fileUpload)  //photoUpload
router.get('/pagination', controller.pagination) //geting user's data
router.post("/updateProfilePhoto", jwt.auth, controller.updateProfilePhoto,)
router.post('/qrCode', controller.qrCode) //generating qr code
router.get('/twoFactorAuth', controller.twoFactorAuth)//2fa
router.post('/verify2Fa', controller.verify2Fa)    //verify
router.get('/aggrigatePaginate', controller.aggrigatePaginate) //aggrigation and pagination
router.get('/userList', controller.userList)   //userlist with specified key                          
router.get('/allUserList', controller.allUserList)    //  all users with specified keys 
router.get('/cronJob', controller.cronJob)  //cronjob verifying otp on 12 pm


module.exports = router;