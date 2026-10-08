const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    isOffer:{
        type:Boolean,
        default:false
    },
    offerPercentage:{
        type:Number,
        default:0
    },
    offerPrice:{
        type:Number,
        default:0
    },
    category: {
        type: String,
        required: true
    },
    wishlist:{
        type:Boolean,
        required:false,
        default:false
    },
    image: {
        type: String
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
})
module.exports =mongoose.model("Product",productSchema)
