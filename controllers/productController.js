
const product = require('../models/product')
const Product = require('../models/product')

exports.createProduct = async (req, res) => {
    try {
        const {
            title, description, price, category
        } = req.body

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No image uploaded",
            })
        }
        const newProduct = new Product({
            title, description, category, price, image: req.file.path,
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
        const updateProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
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
