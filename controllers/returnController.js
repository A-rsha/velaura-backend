
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Return = require("../models/Return");

const allowedReasons = [
    "Damaged item",
    "Wrong item received",
    "Item not as described",
    "Quality issue",
    "Other"
];

exports.requestReturn = async (req, res) => {
    try {
        const userId = req.user.userId;

        const { orderId, items, reason, comments } = req.body;

        if (!mongoose.isValidObjectId(orderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID"
            });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Please select at least one item"
            });
        }

        if (!allowedReasons.includes(reason)) {
            return res.status(400).json({
                success: false,
                message: "Please select a valid return reason"
            });
        }

        if (
            comments !== undefined &&
            (
                typeof comments !== "string" ||
                comments.length > 1000
            )
        ) {
            return res.status(400).json({
                success: false,
                message: "Comments must be under 1000 characters"
            });
        }

        const order = await Order.findOne({
            _id: orderId,
            userId
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        if (order.orderStatus !== "delivered") {
            return res.status(400).json({
                success: false,
                message: "Only delivered orders can be returned"
            });
        }

        if (!order.deliveredAt) {
            return res.status(400).json({
                success: false,
                message: "Delivery date is not available for this order"
            })
        }

        const returnDeadline = new Date(order.deliveredAt);
        returnDeadline.setHours(returnDeadline.getHours() + 48)

        if (Date.now() > returnDeadline.getTime()) {
            return res.status(400).json({
                success: false,
                message: "The 2-day return period has expired"
            })
        }


        const uniqueItemIds = new Set();

        for (const item of items) {
            if (
                !item.orderItemId ||
                !mongoose.isValidObjectId(item.orderItemId) ||
                uniqueItemIds.has(String(item.orderItemId)) ||
                !Number.isInteger(item.quantity) ||
                item.quantity < 1
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid return item or quantity"
                });
            }

            uniqueItemIds.add(String(item.orderItemId));

            const orderItem = order.items.id(item.orderItemId);

            if (!orderItem || item.quantity > orderItem.quantity) {
                return res.status(400).json({
                    success: false,
                    message: "Selected item or quantity is invalid"
                });
            }
        }

        // Prevent returning the same order item more than once.
        const existingReturns = await Return.find({
            orderId,
            status: { $in: ["requested", "approved", "completed"] },
            "items.orderItemId": {
                $in: items.map(item => item.orderItemId)
            }
        });

        for (const item of items) {
            const alreadyReturnedQuantity = existingReturns.reduce(
                (total, returnRequest) => {
                    return total + returnRequest.items.reduce(
                        (sum, returnedItem) => {
                            if (
                                String(returnedItem.orderItemId) ===
                                String(item.orderItemId)
                            ) {
                                return sum + returnedItem.quantity;
                            }

                            return sum;
                        },
                        0
                    );
                },
                0
            );

            const orderItem = order.items.id(item.orderItemId);

            if (alreadyReturnedQuantity + item.quantity > orderItem.quantity) {
                return res.status(400).json({
                    success: false,
                    message: "A return request already exists for the selected quantity"
                });
            }
        }

        const returnItems = items.map(item => {
            const orderItem = order.items.id(item.orderItemId);

            return {
                orderItemId: orderItem._id,
                productId: orderItem.productId,
                quantity: item.quantity
            };
        });

        const returnRequest = await Return.create({
            userId,
            orderId,
            items: returnItems,
            reason,
            comments: comments?.trim() || "",
            status:"approved",
            pickupEstimatedDate: new Date(
                Date.now() + 2 * 24 * 60 * 60 * 1000
            )
        });

        return res.status(201).json({
            success: true,
            message: "Return request submitted successfully",
            returnRequest
        });

    } catch (error) {
        console.error("Return Request Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to submit return request"
        });
    }
};


exports.getMyReturns = async (req, res) => {
    try {
        const userId = req.user.userId;

        const returns = await Return.find({ userId })
            .populate("orderId")
            .populate("items.productId")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            returns
        });

    } catch (error) {
        console.error("Get My Returns Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch return requests"
        });
    }
};


exports.updateReturnStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        // Validate status
        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid return status"
            });
        }

        // Validate return request ID
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid return request ID"
            });
        }

        // Find return request
        const returnRequest = await Return.findById(id);

        if (!returnRequest) {
            return res.status(404).json({
                success: false,
                message: "Return request not found"
            });
        }

        // Only pending requests can be updated
        if (returnRequest.status !== "requested") {
            return res.status(400).json({
                success: false,
                message: "This return request has already been processed"
            });
        }

        // Update status
        returnRequest.status = status;
        if (status === "approved") {
            returnRequest.pickupEstimatedDate = new Date(
                Date.now() + 2 * 24 * 60 * 60 * 1000
            )
        }
        await returnRequest.save()

        return res.status(200).json({
            success: true,
            message: `Return request ${status} successfully`,
            returnRequest
        });

    } catch (error) {
        console.error("Update Return Status Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update return request"
        });
    }
};

exports.getAllReturns = async (req, res) => {
    try {
        const returns = await Return.find()
            .populate("userId")
            .populate("orderId")
            .populate("items.productId")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            returns
        });

    } catch (error) {
        console.error("Get All Returns Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch return requests"
        });
    }
};
