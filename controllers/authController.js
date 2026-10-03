const bcrypt =require('bcryptjs')
const jwt =require('jsonwebtoken')
const User = require('../models/User')

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(409).json({
                success: false,
                message: "All fields are required"
            })
        }

        const exisitingUser = await User.findOne({ email })
        if (exisitingUser) {
            return res.status(409).json({
                success: false,
                message: "User Already exist",
            })
        }

        const hashedPassword =await bcrypt.hash(password,10)

        const newUser = new User({
            name,
             email,
              password:hashedPassword
        })
        await newUser.save();

        res.status(201).json({
            success: true,
            message: "User created successfully",
        })
    } catch (error) {
        console.error("Error in register:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        })
    }
}


exports.login=async(req,res)=>{
    try {
     const {email,password}=req.body;

     if(!email || !password){
        return res.status(400).json({
            success:false,
            message:"email and password are required"
        })
     }
     
     const user =await User.findOne({email});
     if(!user){
        return res.status(400).json({
            success:false,
            message:"Invalid email or password",
        })
     }
     const isPasswordMatch =await bcrypt.compare(
        password,
        user.password
     )

     if(!isPasswordMatch){
        return res.status(400).json({
            success:false,
            message:"Invalid email or password"
        })
     }

     const token =jwt.sign(
        {
            userId:user.id,
            role:user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn:"1d"
        }
     )

     const refreshToken= jwt.sign(
        {
            userId:user.id
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn:"7d"
        }
     )
      user.refreshToken =refreshToken
        await user.save()
        
     res.status(200).json({
        success:true,
        message:"Login successful",
        token,
        user:{
            id:user.id,
            name:user.name,
            email:user.email,
            role:user.role
        }

     })
    } catch (error) {
        console.log('LOGIN ERROR:',error)
        res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}

exports.getProfile = async (req, res) => {
    try {

        const userId = req.user.userId

        const user = await User.findById(userId).select("-password")

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        res.status(200).json({
            success: true,
            user
        })

    } catch (error) {

        console.log(error.message)

        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}