const Review =require('../models/Review')
const Product =require('../models/product')
const Order =require('../models/Order')

exports.addReview=async(req,res)=>{
    try {
        const {productId,userId,rating,comment}=req.body
        if(!productId || !rating || !comment){
            return res.status(400).json({
                success:false,
                message:"product,rating and comment are required"
            })
        }
        
        if(Number(rating) < 1 || Number(rating) > 5){
            return res.status(400).json({
                success:false,
                message:"Rating must be between 1 and 5 "
            })
        }

        const purchaseOrder =await Order.findOne({
            userId:req.user.userId,
            "items.productId":productId,
            paymentStatus:"success"
        })

        if(!purchaseOrder){
            return res.status(403).json({
                success:false,
                message:"You can review this product only after purchasing it."
            })
        }

        const product =await Product.findById(productId)

        if(!product){
            return res.status(404).json({
                success:false,
                message:"Product not found"
            })
        }
        console.log("Decoded user:", req.user)

        const review =new Review({
            productId,
            userId:req.user.userId,
            rating:Number(rating),
            comment
        })
        const savedReview =await review.save()

        return res.status(201).json({
            success:true,
            message:"Review added successfully",
            data:savedReview
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.getProductReviews =async(req,res)=>{
    try {
        const reviews =await Review.find({
            productId:req.params.productId
        })
        .populate('userId', 'name')
        .sort({createdAt: -1})

        return res.status(200).json({
            success:true,
            data:reviews
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}