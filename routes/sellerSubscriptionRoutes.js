const express =require('express')
const router =express.Router()

const authMiddleware =require('../middleware/authMiddleware')
const sellerSubscriptionController =require("../controllers/sellerSubscriptionController")

router.post("/createSubOrder", authMiddleware,sellerSubscriptionController.createSubscriptionOrder)
router.post('/verifySubPayment', authMiddleware,sellerSubscriptionController.verifySubscriptionPayment)
module.exports=router