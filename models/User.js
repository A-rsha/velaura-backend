const mongoose =require('mongoose')

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        lowercase: true,
        trim:true
    },
    password:{
        type:String,
        required: function(){
            return !this.googleId;
        }
    },

    googleId: {
        type:String,
        default:null
    },
    
 role:{
       type:String,
       enum:["admin","user"],
       default:"user"
    },
    refreshToken:{
        type:String,
        default:null
    },
    wishlist:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Product"
        }
    ]
},{timestamps:true})


module.exports=mongoose.model("User",userSchema)