const express=require('express')
const authMiddleware =require('../middleware/authMiddleware')
const reviewController =require('../controllers/reviewController')

const router=express.Router()
router.post('/addReview',authMiddleware,reviewController.addReview)
router.get('/getReview/:productId',reviewController.getProductReviews)
router.get('/getAllReviews',reviewController.getAllReviews)
module.exports =router