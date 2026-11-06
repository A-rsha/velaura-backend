const mongoose = require('mongoose')

const sellerStoreSchema = new mongoose.Schema(
    {
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        storeName: {
            type: String,
            required: true,
            trim: true
        },

        businessDescription: {
            type: String,
            default: ""
        },

        phone: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true,
            trim: true
        },

        city: {
            type: String,
            required: true
        },

        state: {
            type: String,
            required: true
        },
        pincode: {
            type: String,
            required: true
        },
        termsAccepted: {
            type: Boolean,
            default: false
        },
        termsAcceptedAt: {
            type: Date,
            default: null
        }

    },
    { timestamps: true }

)

module.exports = mongoose.model('SellerStore', sellerStoreSchema)