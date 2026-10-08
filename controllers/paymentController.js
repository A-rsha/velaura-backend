const RazorPay = require("razorpay");
const Cart = require("../models/cart");
const crypto = require("crypto");
const Order = require("../models/Order");

const razorpay = new RazorPay({
    key_id: process.env.VITE_RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});


// Create Razorpay Order
exports.createRazorpayOrder = async (req, res) => {
    try {

        const userId = req.user.userId;

        const cart = await Cart.findOne({ userId })
            .populate("items.productId");

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        if (cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty"
            });
        }

        const totalAmount = cart.items.reduce(
            (total, item) => {
                const price = item.productId?.isOffer
                    ? item.productId?.offerPrice
                    : item.price;

                return total + (price * item.quantity);
            },
            0
        );

        const options = {
            amount:Math.round( totalAmount * 100),
            currency: "INR"
        };

        const razorpayOrder = await razorpay.orders.create(options);

        return res.status(200).json({
            success: true,
            order: razorpayOrder
        });

    } catch (error) {

        console.log("RAZORPAY ORDER ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create Razorpay order",
            error: error.message
        });
    }
};



exports.verifyPayment = async (req, res) => {
    console.log("VERIFY PAYMENT API CALLED");
    try {
        console.log("VERIFY BODY:", req.body);

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            shippingAddress,
            paymentMethod
        } = req.body;


        // Create signature body
        const body =
            razorpay_order_id +
            "|" +
            razorpay_payment_id;


        // Generate expected signature
        const expectedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(body)
            .digest("hex");


        // Check signature
        if (expectedSignature !== razorpay_signature) {

            return res.status(400).json({
                success: false,
                message: "Invalid payment signature"
            });
        }


        // Get logged-in user's ID
        const userId = req.user.userId;


        const cart = await Cart.findOne({ userId })
            .populate("items.productId");
        if (!cart) {

            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }


        if (cart.items.length === 0) {

            return res.status(400).json({
                success: false,
                message: "Cart is empty"
            });
        }


        // Calculate total amount
        const totalAmount = cart.items.reduce(
            (total, item) => {
                const price = item.productId?.isOffer
                    ? item.productId?.offerPrice
                    : item.price;

                return total + (price * item.quantity);
            },
            0
        );


        // Create Order
        const newOrder = new Order({

            userId: userId,

            items: cart.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.productId?.isOffer
                     ? item.productId?.offerPrice
                     : item.price
            })),

            totalAmount: totalAmount,

            shippingAddress: shippingAddress,

            paymentMethod: paymentMethod,

            paymentStatus: "success"
        });


        await newOrder.save();
        console.log("ORDER SAVED:", newOrder);


        // Clear cart
        cart.items = [];

        await cart.save();


        return res.status(200).json({
            success: true,
            message: "Payment verified and order created successfully",
            order: newOrder
        });


    } catch (error) {

        console.error(
            "Payment Verification Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Payment verification failed",
            error: error.message
        });
    }
};