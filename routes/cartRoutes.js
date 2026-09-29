const express =require('express')
const cartController = require('../controllers/cartController')

const router = express.Router()

router.post('/add',cartController.addToCart)
router.get('/getCart',cartController.getCart)
router.put('/updateCart',cartController.updateCartQuantity)
router.delete('/removeFromCart',cartController.removeFromCart)

module.exports=router