const User =require('../models/User')
const Product =require('../models/product')

exports.addToWishlist=async(req,res)=>{
    try {
        const userId =req.user.userId
        const productId=req.params.productId

        const product =await Product.findById(productId)

        if(!product){
            return res.status(404).json({
                message:"Product not found"
            })
        }

        const user =await User.findById(userId)

        if(!user){
            return res.status(404).json({
                message:"user not found"
            })
        }
        if(user.wishlist.includes(productId)){
            return res.status(400).json({
                message:"Product already in wihslist"
            })
        }
        user.wishlist.push(productId)
        await user.save()
        res.status(200).json({
            message:"Product added to wishlist",
            wishlist:user.wishlist
        })
    } catch (error) {
        res.status(500).sjon({
            message:"Failed to add product to whishlist",
            error:error.message
        })
    }
}

exports.getWishlist=async(req,res)=>{
    try {
        const userId = req.user.userId
        const user=await User.findById(userId)
        .populate('wishlist')

        if(!user){
            return res.status(404).json({
                message:"User not found"
            })
        }
        res.status(200).json({
            wishlist:user.wishlist
        })
    } catch (error) {
        res.status(500).json({
            message:"Failed to get wishlist",
            error:error.message
        })
    }
}

exports.removeFromWishlist =async(req,res)=>{
    try {
        const userId =req.user.userId
        const productId =req.params.productId

        const user= await User.findById(userId)

        if(!user){
            res.status(404).json({
                message:"user not found"
            })
        }

        user.wishlist =user.wishlist.filter(
            (id)=>id.toString() !== productId
        )
        await user.save()

        res.status(200).json({
            message:"Product removed from wishlist",
            wishlist:user.wishlist
        })
    } catch (error) {
        res.status(500).json({
            message:"Failed to remove product from wishlist",
            error:error.message
        })
    }
}
