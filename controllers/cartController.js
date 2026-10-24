const Cart = require('../models/cart');
const Product = require('../models/product')
exports.addToCart = async (req, res) => {
try {
const { productId } = req.body;
const quantity = Number(req.body.quantity ?? 1);
const userId = req.user.userId;

    // Validate product ID
    if (!productId) {
        return res.status(400).json({
            success: false,
            message: "Product ID is required"
        });
    }

    // Validate quantity
    if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
            success: false,
            message: "Please provide a valid quantity"
        });
    }

    // Find product
    const product = await Product.findById(productId);

    if (!product) {
        return res.status(404).json({
            success: false,
            message: "Product not found"
        });
    }

    // Find user's cart
    let cart = await Cart.findOne({ userId });

    // Create cart if it doesn't exist
    if (!cart) {
        cart = await Cart.create({
            userId,
            items: [
                {
                    productId,
                    quantity,
                    price: product.isOffer
                        ? product.offerPrice
                        : product.price
                }
            ]
        });

        return res.status(201).json({
            success: true,
            message: "Product added to cart successfully",
            cart
        });
    }

    // Check if product already exists in cart
    const existingItem = cart.items.find(
        item => item.productId.toString() === productId.toString()
    );

    if (existingItem) {
        return res.status(409).json({
            success: false,
            message: "This product is already in your cart"
        });
    }

    // Add new product to cart
    cart.items.push({
        productId,
        quantity,
        price: product.isOffer
            ? product.offerPrice
            : product.price
    });

    await cart.save();

    return res.status(200).json({
        success: true,
        message: "Product added to cart successfully",
        cart
    });

} catch (error) {
    console.error("ADD TO CART ERROR:", error);

    return res.status(500).json({
        success: false,
        message: "Unable to add product to cart"
    });
}

};


exports.getCart=async(req,res)=>{
    try {
        const userId =req.user.userId
        const cart =await Cart.findOne({userId})
        .populate("items.productId")

        if(!cart){
            return res.status(404).json({
                success:false,
                message:"Cart not found"
            })
        }
        return res.status(200).json({
            success:true,
            cart
        })
    } catch (error) {
       return res.status(500).json({
        message:error.message
       }) 
    }
}

exports.updateCartQuantity= async(req,res)=>{
    try {
        const {productId,quantity}=req.body;
        const userId =req.user.userId;

        const cart =await Cart.findOne({userId})
        if(!cart){
            return res.status(404).json({
                success:false,
                message:"Cart not found"
            })
        }
        const item =cart.items.find(
            item => item.productId.toString() === productId
        )
        if(!item){
            return res.status(404).json({
                success:false,
                message:"Product not found in cart"
            })
        }
        item.quantity =quantity
        await cart.save()

        return res.status(200).json({
            success:true,
            message:"cart quantity updated",cart
        })
    } catch (error) {
        return res.status(500).json({
            message:error.message
        })
    }

}

exports.removeFromCart =async(req,res)=>{
    try {
        const {productId}=req.body
        const userId =req.user.userId

        const cart =await Cart.findOne({userId})
        if(!cart){
            return res.status(404).json({
                success:false,
                message:"Cart not found"
            })
        }
        cart.items =cart.items.filter(
            item => item.productId.toString() !== productId
        )
        await cart.save()
        return res.status(200).json({
            success:true,
            message:"Product removed form cart",cart
        })

    } catch (error) {
        return res.status(500).json({
            message:error.message
        })
    }
}