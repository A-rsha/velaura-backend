const Cart = require('../models/cart');
const Product = require('../models/product')
exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user.userId

        const product = await Product.findById(productId)

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            })
        }

        let cart = await Cart.findOne({ userId })

        if (!cart) {
            cart = await Cart.create({
                userId,
                items: [
                    {
                        productId,
                        quantity,
                        price: product.price
                    }
                ]
            })

            return res.status(201).json({
                success: true,
                message: "Product added to cart",
                cart
            })
        }

        const existingItem = cart.items.find(
            item => item.productId.toString() === productId
        )

        if (existingItem) {
            existingItem.quantity += quantity
        } else {
            cart.items.push({
                productId,
                quantity,
                price: product.price
            })
        }

        await cart.save()

        return res.status(200).json({
            success: true,
            message: "Product added to cart",
            cart
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

exports.getCart=async(req,res)=>{
    try {
        const userId =req.user.userId
        const cart =await Cart.findOne({userId})
        .populate("items.productId")

        if(!cart){
            return res.status(404).json({
                success:false,
                message:"Cart not found"
            })
        }
        return res.status(200).json({
            success:true,
            cart
        })
    } catch (error) {
       return res.status(500).json({
        message:error.message
       }) 
    }
}

exports.updateCartQuantity= async(req,res)=>{
    try {
        const {productId,quantity}=req.body;
        const userId =req.user.userId;

        const cart =await Cart.findOne({userId})
        if(!cart){
            return res.status(404).json({
                success:false,
                message:"Cart not found"
            })
        }
        const item =cart.items.find(
            item => item.productId.toString() === productId
        )
        if(!item){
            return res.status(404).json({
                success:false,
                message:"Product not found in cart"
            })
        }
        item.quantity =quantity
        await cart.save()

        return res.status(200).json({
            success:true,
            message:"cart quantity updated",cart
        })
    } catch (error) {
        return res.status(500).json({
            message:error.message
        })
    }

}

exports.removeFromCart =async(req,res)=>{
    try {
        const {productId}=req.body
        const userId =req.user.userId

        const cart =await Cart.findOne({userId})
        if(!cart){
            return res.status(404).json({
                success:false,
                message:"Cart not found"
            })
        }
        cart.items =cart.items.filter(
            item => item.productId.toString() !== productId
        )
        await cart.save()
        return res.status(200).json({
            success:true,
            message:"Product removed form cart",cart
        })

    } catch (error) {
        return res.status(500).json({
            message:error.message
        })
    }
}