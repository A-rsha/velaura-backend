const Category =require('../models/Category')

exports.createCategory =async(req,res)=>{
try {
        const {name}=req.body
    if(!name){
        return res.status(400).json({
            success:false,
            message:"Category name is required"
        })
    }

    if(!req.file){
        return res.status(400).json({
            success:false,
            message:"Category image is required"
        })
    }

    const category =new Category({
        name,
        image:req.file.path
    })

    const savedCategory=await category.save()

    res.status(201).json({
        success:true,
        message:"Category created successfully",
        data: savedCategory
    })
} catch (error) {
    console.log("CREATE CATEGORY ERROR:",error)

    res.status(500).json({
        success:false,
        message:error.message
    })
}
}

exports.getAllCategories =async(req,res)=>{
    try {
        const categories =await Category.find().sort({createdAt: -1})
        res.status(200).json({
            success:true,
            data: categories
        })
    } catch (error) {
        console.log("GET CATEGORY ERROR:",error)
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}
exports.getCategoryById =async(req,res)=>{
    try {
        const category =await Category.findById(req.params.id)

        if(!category){
            return res.status(404).json({
                success:false,
                message:"Category not found"
            })
        }
        res.status(200).json({
            success:true,
            data:category
        })
    } catch (error) {
        console.log(error);
       res.status(error.status || 500).json({
        error:error.message || " Internal server error"
       })
    }
}

exports.updateCategories =async(req,res)=>{
        try {
            const updateData={
                name:req.body.name,

            }
            if(req.file){
                updateData.image=req.file.path
            }
            const updateCategories = await Category.findByIdAndUpdate(
                req.params.id,
                updateData,{
                    new:true,
                    runValidators:true
                }
            )
            if(!updateCategories){
                return res.status(404).json({
                    success:false,
                    message:"Category not found"
                })
            }
            res.status(200).json({
                success:true,
                message:"Category updated successfully",
                data:updateCategories
            })
        } catch (error) {
            console.log(error)
            res.status(error.status || 500).json({
                error:error.message || "Internal server error"
            })
        }
}

exports.deleteCategories=async(req,res)=>{
    try {
        const deleteCategories=await Category.findByIdAndDelete(req.params.id)
        if(!deleteCategories){
            return res.status(404).json({
                success:false,
                message:"Category not found"
            })
        }

        res.status(200).json({
            success:true,
            message:"Category deleted successfully"
        })
    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({
            error: error.message || "Internal server error"
        })
    }
}