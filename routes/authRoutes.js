const express= require('express')
const authController =require('../controllers/authController')
const authMiddleware = require('../middleware/authMiddleware')
const router=express.Router()
router.post("/register",authController.register)
router.post("/login",authController.login)
router.post("/send-otp", authController.sendRegistrationOTP)
router.post("/verify-otp", authController.verifyRegistrationOTP);
router.post(
    "/verify-login-otp",
    authController.verifyLoginOTP
);
router.post('/refresh',authController.refreshToken)
router.get('/profile',authMiddleware,authController.getProfile)

module.exports=router