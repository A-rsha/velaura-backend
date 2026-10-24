const mongoose = require('mongoose')

const returnSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },


        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true
        },

        items: [
            {
                orderItemId: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true
                },
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1
                }
            }
        ],

        reason: {
            type: String,
            enum: [
                "Damaged item",
                "Wrong item received",
                "Item not as described",
                "Quality issue",
                "Other"
            ],
            required: true
        },

        comments: {
            type: String,
            default: ""
        },
        pickupEstimatedDate: {
    type: Date,
    default: null
},

        status: {
            type: String,
            enum: [
                "requested",
                "approved",
                "rejected",
                "completed"
            ],
            default: "requested"
        },
        deliveredAt: {
            type: Date,
            default: null
        },


    },
    { timestamps: true }
)
module.exports = mongoose.model("Return", returnSchema)