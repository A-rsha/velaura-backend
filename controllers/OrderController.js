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

exports.trackOrder=async(req,res)=>{
    try {
        const userId=req.user.userId
        const{orderId}=req.params

        const order =await Order.findOne({
            _id:orderId,
            userId
        }).populate("items.productId")

        if(!order){
            return res.status(404).json({
                succcess:false,
                message:"Order not found"
            })
        }

        return res.status(200).json({
            success:true,
            message:"Odrer tracking details fetched successfully",
            order
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}


exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params
        const { orderStatus } = req.body

        const allowedStatuses = [
            "confirmed",
            "shipped",
            "out_for_delivery",
            "delivered",
            "cancelled"
        ]

       
        if (!allowedStatuses.includes(orderStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status"
            })
        }

        // Find the order
        const order = await Order.findById(orderId)

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            })
        }

        // Prevent updating a cancelled or delivered order
        if (["cancelled", "delivered"].includes(order.orderStatus)) {
            return res.status(400).json({
                success: false,
                message: `This order is already ${order.orderStatus}`
            })
        }

        // Update order status
        order.orderStatus = orderStatus

        if (orderStatus === "shipped") {
            order.shippedAt = new Date()

            // Generate a tracking number if one doesn't exist
            if (!order.trackingNumber) {
                order.trackingNumber =
                    "VEL" + Date.now().toString()
            }
        }

     
        if (orderStatus === "delivered") {
            order.deliveredAt = new Date()
        }

        // Add the status to the history
        order.statusHistory.push({
            status: orderStatus,
            updatedAt: new Date(),
            note: `Order status updated to ${orderStatus}`
        })

        await order.save()

        return res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            order
        })

    } catch (error) {
        console.error("Update Order Status Error:", error)

        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

