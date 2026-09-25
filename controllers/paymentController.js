const RazorPay = require('razorpay')
const Cart =require('../models/cart')
const crypto=require('crypto')

const razorpay =new RazorPay({
    key_id: process.env.VITE_RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})
exports.createRazorpayOrder =async(req,res)=>{
    try {
        const userId =req.user.userId
        const cart=await Cart.findOne({userId})
        if(!cart){
            return res.status(404).json({
                success:false,
                message:"Cart not found"
            })
        }

        if(cart.items.length === 0){
            return res.status(400).json({
                success:false,
                message:"Cart is empty"
                        })
        }
        const totalAmount =cart.items.reduce((total,item)=>{
            return total + (item.price * item.quantity)
        },0)

        const options ={
            amount:totalAmount *100,
            currency:"INR",
            
        }

        const razorpayOrder=await razorpay.orders.create(options)
        return res.status(200).json({
            success:true,
            order:razorpayOrder
        })
    } catch (error) {
        console.log("RAZORPAY ORDER ERROR:", error); 
        return res.status(500).json({
             success: false, 
             message: "Failed to create Razorpay order",
              error: error.message
             }); 
    }
}

exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const body =
      razorpay_order_id +
      "|" +
      razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {

    

      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid payment signature",
    });

  } catch (error) {
    console.error("Payment Verification Error:", error);

    res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });
  }
};