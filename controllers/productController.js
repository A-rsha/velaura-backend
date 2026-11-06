
const Product = require('../models/product')

exports.createProduct = async (req, res) => {
    try {
        const {
            title, description, price, category,isOffer,offerPercentage,offerPrice
        } = req.body

        const offerStatus =isOffer === "true"
        const percentage =Number(offerPercentage)
        const finalOfferPrice =Number(offerPrice)

        if (!req.files || req.files.length < 3) {
            return res.status(400).json({
                success: false,
                message: "Please upload at least 3 Images",
            })
        }

        const imageUrls = req.files.map(file => file.path)
        const newProduct = new Product({
            title, description, category, price, isOffer:offerStatus, offerPercentage:percentage, offerPrice:finalOfferPrice, image: imageUrls[0], images: imageUrls,
            createdBy: req.user.userId,
            vendorId: req.user.role === 'vendor' ? req.user.userId : null
        })
        const savedProduct = await newProduct.save()
        res.status(201).json({
            success: true,
            data: savedProduct,
        })
    } catch (error) {
        console.log("CREATE PRODUCT ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

exports.getAllProduct = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json({
            success: true,
            data: products
        })
    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({
            error: error.message || "Internal server error"
        })
    }
}

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "product not found"
            })
        }
        res.status(200).json({
            success: true,
            data: product
        })
    } catch (error) {
        console.log(error);
        res.status(error.status || 500).json({
            error: error.message || "Internal serverr error"
        })
    }
}

exports.getOfferProducts =async(req,res)=>{
    try {
        const products =await Product.aggregate([
            {
            $match: {
                isOffer:true,
                offerPercentage: {$gt:0, $lte:30}
            }
        },
        {
            $limit:4
        }
        ])
        return res.status(200).json({
            success:true,
            data:products
        })
    } catch (error) {
        console.log("GET OFFER PRODUCTS ERROR:",error)
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}
exports.newArrivals =async(req,res)=>{
    try {
        const products = await Product.aggregate([
            {
                $sort:{
                    createdAt:-1
                }
            },
            {
                $limit:4
            }
        ])
        return res.status(200).json({
            success:true,
            data:products
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.getMyVendorProducts = async (req, res) => {
    try {
        const products = await Product.find({
            vendorId: req.user.userId
        }).sort({ createdAt: -1 })

        return res.status(200).json({
            success: true,
            data: products
        })
    } catch (error) {
        console.log("GET VENDOR PRODUCTS ERROR:", error)

        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}
exports.updateProduct = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            price,
            isOffer,
            offerPercentage,
            offerPrice
        } = req.body

        const updateData = {
            title,
            description,
            category,
            price,
            isOffer: isOffer === "true",
            offerPercentage: Number(offerPercentage) || 0,
            offerPrice: Number(offerPrice) || 0
        }

        // Update images only when new images are uploaded
        if (req.files && req.files.length > 0) {
            const imageUrls = req.files.map((file) => file.path)

            updateData.image = imageUrls[0]
            updateData.images = imageUrls
        }

        const existingProduct = await Product.findById(req.params.id)

if (!existingProduct) {
    return res.status(404).json({
        success: false,
        message: "Product not found"
    })
}

if (
    req.user.role === 'vendor' &&
    existingProduct.vendorId?.toString() !== req.user.userId
) {
    return res.status(403).json({
        success: false,
        message: "You can only update your own products"
    })
}

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        )

        if (!updatedProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: updatedProduct
        })

    } catch (error) {
        console.log("UPDATE PRODUCT ERROR:", error)

        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        })
    }
}



exports.deleteProduct = async (req, res) => {
    try {

        const existingProduct = await Product.findById(req.params.id)

if (!existingProduct) {
    return res.status(404).json({
        success: false,
        message: "Product not found"
    })
}

if (
    req.user.role === 'vendor' &&
    existingProduct.vendorId?.toString() !== req.user.userId
) {
    return res.status(403).json({
        success: false,
        message: "You can only delete your own products"
    })
}
        const deleteProduct = await Product.findByIdAndDelete(req.params.id);

        if (!deleteProduct) {
            return res.status(404).json({
                success: false,
                message: "product not found"
            })
        }
        res.status(200).json({
            success: true,
            message: "product delete successfully",

        })
    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({
            error: error.message || "Internal server error"
        })
    }
}
