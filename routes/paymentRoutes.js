const express =require("express")
const router =express.Router()

const authMiddleware =require("../middleware/authMiddleware")
const paymentController =require("../controllers/paymentController")

router.post('/createOrder',authMiddleware,paymentController.createRazorpayOrder)
router.post('/verify',authMiddleware,paymentController.verifyPayment)

module.exports =router;