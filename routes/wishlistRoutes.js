const express =require('express')
const router =express.Router()

const authMiddleware =require('../middleware/authMiddleware')
const wishlistController =require('../controllers/wishlistController')

router.post('/add/:productId',authMiddleware,wishlistController.addToWishlist)
router.get('/get',authMiddleware,wishlistController.getWishlist)
router.delete('/remove/:productId',authMiddleware,wishlistController.removeFromWishlist)
module.exports=router