const Cart = require("../models/cart");
const Order = require("../models/Order");
exports.createOrder = async (req, res) => {
    try {
        const userId = req.user.userId
        const { shippingAddress, paymentMethod } = req.body

        const cart = await Cart.findOne({ userId })

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            })
        }

        if (cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty"
            })
        }

        const totalAmount = cart.items.reduce((total, item) => {
            return total + (item.price * item.quantity)
        }, 0)

        const order = await Order.create({
            userId,
            items: cart.items,
            totalAmount,
            shippingAddress,
            paymentMethod
        })

        cart.items = []
        await cart.save()

        return res.status(201).json({
            success: true,
            message: "Order created successfully",
            order
        })

    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

exports.getMyOrders=async(req,res)=>{
    try {
        const userId=req.user.userId

        const orders=await Order.find({userId})
        .populate("items.productId")

        return res.status(200).json({
            success:true,
            orders
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.getAllOrders=async(req,res)=>{
    try {
        const orders = await Order.find()
        .populate("userId","name email")
        .populate("items.productId")

        return res.status(200).json({
            success:true,orders
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}