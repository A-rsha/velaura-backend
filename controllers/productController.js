
const Product = require('../models/product')

exports.createProduct = async (req, res) => {
    try {
        const {
            title, description, price, category,isOffer,offerPercentage,offerPrice
        } = req.body

        const offerStatus =isOffer === "true"
        const percentage =Number(offerPercentage)
        const finalOfferPrice =Number(offerPrice)

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No image uploaded",
            })
        }
        const newProduct = new Product({
            title, description, category, price, isOffer:offerStatus, offerPercentage:percentage, offerPrice:finalOfferPrice, image: req.file.path,
            createdBy: req.user.userId
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

exports.updateProduct = async (req, res) => {
    try {
        const updateData={
            title:req.body.title,
            description:req.body.description,
            category:req.body.category,
            price:req.body.price,
            isOffer: req.body.isOffer === "true",
            offerPercentage: Number(req.body.offerPercentage) || 0,
            offerPrice: Number(req.body.offerPrice) || 0
        }

        if(req.file){
            updateData.image =req.file.path
        }
        const updateProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true

            }
        )
        if (!updateProduct) {
            return res.status(404).json({
                success: false,
                message: "product not found"
            })
        }
        res.status(200).json({
            success: true,
            message: "product updated successfully",
            data: updateProduct
        })
    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({
            error: error.message || "Internal server error"
        })
    }
}

exports.deleteProduct = async (req, res) => {
    try {
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
