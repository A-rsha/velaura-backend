const mongoose =require('mongoose')

const AdSchema =new mongoose.Schema({
    image:{
        type:String
    },
    publicId:{
        type:String,
        required:true
    },
},{
    timestamps:true
})
module.exports =mongoose.model("Ad",AdSchema)