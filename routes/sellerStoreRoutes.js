const express =require('express')
const router =express.Router()
const authMiddleware =require('../middleware/authMiddleware')
const sellerStoreController =require('../controllers/sellerStoreController')

router.post('/createStore',authMiddleware,sellerStoreController.createSellerStore)
router.get('/myStore',authMiddleware,sellerStoreController.getMySellerStore)
router.post(
    '/acceptTerms',
    authMiddleware,
    sellerStoreController.acceptSellerTerms
)
module.exports=router