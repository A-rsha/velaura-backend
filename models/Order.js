const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },

            quantity: {
                type: Number,
                required: true
            },

            price: {
                type: Number,
                required: true
            }
        }
    ],

    totalAmount: {
        type: Number,
        required: true
    },

    shippingAddress: {
        type: String,
        required: true
    },

    paymentMethod: {
        type: String,
        enum: ["UPI", "CARD", "NetBanking"],
        required: true
    },

    paymentStatus: {
        type: String,
        enum: ["pending", "success", "failed"],
        default: "pending"
    }

}, { timestamps: true })

module.exports = mongoose.model("Order", orderSchema)