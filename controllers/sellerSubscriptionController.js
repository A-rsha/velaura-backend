const RazorPay = require("razorpay");
const SellerSubscription = require("../models/SellerSubscription");
const User = require("../models/User");
const mongoose = require("mongoose");
const crypto = require("crypto");

const razorpay = new RazorPay({
    key_id: process.env.VITE_RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const subscriptionPlans = {
    monthly: {
        amount: 199,
        duration: 1
    },
    yearly: {
        amount: 499,
        duration: 12
    }
};


// CREATE SUBSCRIPTION PAYMENT ORDER
exports.createSubscriptionOrder = async (req, res) => {
    try {
        const { plan } = req.body;
        const vendorId = req.user.userId;

        const selectedPlan = subscriptionPlans[plan];

        if (!selectedPlan) {
            return res.status(400).json({
                success: false,
                message: "Please select a valid subscription plan"
            });
        }

        const razorpayOrder = await razorpay.orders.create({
            amount: selectedPlan.amount * 100,
            currency: "INR",
            receipt: `sub_${Date.now()}`
        });

        const subscription = await SellerSubscription.create({
            vendorId,
            plan,
            amount: selectedPlan.amount,
            razorpayOrderId: razorpayOrder.id,
            status: "created"
        });

        return res.status(201).json({
            success: true,
            message: "Subscription payment order created",
            order: razorpayOrder,
            subscriptionId: subscription._id
        });

    } catch (error) {
        console.error("SUBSCRIPTION ORDER ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create subscription payment order"
        });
    }
};


// VERIFY SUBSCRIPTION PAYMENT
exports.verifySubscriptionPayment = async (req, res) => {
    let session;

    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        const vendorId = req.user.userId;

        // Check payment details
        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment details are required"
            });
        }

        // Find the pending subscription
        const subscription = await SellerSubscription.findOne({
            vendorId,
            razorpayOrderId: razorpay_order_id,
            status: "created"
        });

        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: "Subscription payment order not found"
            });
        }

        // Generate expected Razorpay signature
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;

        const expectedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(body)
            .digest("hex");

        // Validate signature format
        if (
            !/^[a-fA-F0-9]{64}$/.test(razorpay_signature)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature"
            });
        }

        // Compare signatures safely
        const received = Buffer.from(razorpay_signature, "hex");
        const expected = Buffer.from(expectedSignature, "hex");

        if (
            received.length !== expected.length ||
            !crypto.timingSafeEqual(received, expected)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment signature"
            });
        }

        // Fetch actual payment details from Razorpay
        const payment = await razorpay.payments.fetch(
            razorpay_payment_id
        );

        // Verify payment details
        if (
            payment.order_id !== razorpay_order_id ||
            payment.status !== "captured" ||
            payment.amount !== subscription.amount * 100 ||
            payment.currency !== "INR"
        ) {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed"
            });
        }

        // Calculate subscription dates
        const startDate = new Date();
        const endDate = new Date(startDate);

        endDate.setMonth(
            endDate.getMonth() + subscriptionPlans[subscription.plan].duration
        );

        // Start MongoDB transaction only after payment verification
        session = await mongoose.startSession();

        await session.withTransaction(async () => {

            // Find user inside transaction
            const user = await User.findById(vendorId).session(session);

            if (!user) {
                throw new Error("USER_NOT_FOUND");
            }

            // Update subscription only if it is still pending
            const updatedSubscription =
                await SellerSubscription.findOneAndUpdate(
                    {
                        _id: subscription._id,
                        status: "created"
                    },
                    {
                        $set: {
                            razorpayPaymentId: razorpay_payment_id,
                            status: "success",
                            startDate,
                            endDate
                        }
                    },
                    {
                        new: true,
                        session
                    }
                );

            if (!updatedSubscription) {
                throw new Error("SUBSCRIPTION_ALREADY_VERIFIED");
            }

            // Activate vendor account
            user.role = "vendor";

            user.subscription = {
                plan: subscription.plan,
                status: "active",
                startDate,
                endDate
            };

            await user.save({ session });
        });

        return res.status(200).json({
            success: true,
            message: "Subscription activated successfully",
            subscription: {
                plan: subscription.plan,
                status: "active",
                startDate,
                endDate
            }
        });

    } catch (error) {
        console.error("SUBSCRIPTION VERIFICATION ERROR:", error);

        if (error.message === "USER_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (error.message === "SUBSCRIPTION_ALREADY_VERIFIED") {
            return res.status(400).json({
                success: false,
                message: "Subscription already verified"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Subscription verification failed"
        });

    } finally {
        // Always close the transaction session
        if (session) {
            await session.endSession();
        }
    }
};