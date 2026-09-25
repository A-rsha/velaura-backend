const express =require('express')
const cartController = require('../controllers/cartController')
const authMiddleware = require('../middleware/authMiddleware')
const router = express.Router()

router.post('/add',authMiddleware,cartController.addToCart)
router.get('/getCart',authMiddleware,cartController.getCart)
router.put('/updateCart',authMiddleware,cartController.updateCartQuantity)
router.delete('/removeFromCart',authMiddleware,cartController.removeFromCart)

module.exports=router