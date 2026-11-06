const mongoose = require('mongoose')

const sellerSubscriptionSchema = new mongoose.Schema(
    {
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        plan: {
            type: String,
            enum: ["monthly", "yearly"],
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        razorpayOrderId: {
            type: String,
            required: true
        },
        razorpayPaymentId: {
            type: String,
            default: null
        },
        status: {
            type: String,
            enum: ["created", "success", "failed"],
            default: "created"
        },
        startDate: {
            type: Date,
            default: null
        },
        endDate: {
            type: Date,
            default: null
        }

    }, { timestamps: true }
)

module.exports =mongoose.model('SellerSubscription', sellerSubscriptionSchema)