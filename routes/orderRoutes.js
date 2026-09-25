const express =require('express')
const orderController =require('../controllers/OrderController')
const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMidleware')
const router =express.Router()

router.post('/create',authMiddleware,orderController.createOrder)
router.get('/getMyOrders',authMiddleware,orderController.getMyOrders)
router.get('/getAllOrders',authMiddleware,roleMiddleware('admin'),orderController.getAllOrders)
module.exports= router