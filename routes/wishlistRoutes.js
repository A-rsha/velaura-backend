const express =require('express')
const router =express.Router()


const wishlistController =require('../controllers/wishlistController')

router.post('/add/:productId',wishlistController.addToWishlist)
router.get('/get',wishlistController.getWishlist)
router.delete('/remove/:productId',wishlistController.removeFromWishlist)
module.exports=router