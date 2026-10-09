const express=require('express')
const authMiddleware =require('../middleware/authMiddleware')
const reviewController =require('../controllers/reviewController')

const router=express.Router()
router.post('/addReview',authMiddleware,reviewController.addReview)
router.get('/getReview/:productId',reviewController.getProductReviews)
module.exports =router