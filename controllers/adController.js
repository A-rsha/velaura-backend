const Ad =require('../models/Ad')

exports.getAds =async(req,res)=>{
    try {
        const Ads =await Ad.aggregate([
            {
                $sort:{
                    createdAt:-1
                }
            },
            {
                $limit:6
            }
        ])
        res.status(200).json({
            success:true,
            data:Ads
        })
    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({
            error:error.message || "Internal server error"
        })
    }
}

exports.addAds =async(req,res)=>{
    try {
        if(!req.file){
            return res.status(400).json({
                success:false,
                message:"No image uploaded"
            })
        }
       
        
const count =await Ad.countDocuments()
if(count >= 6){
    return res.status(400).json({
        success:false,
        message:"You can upload a maximum of 6 images"
    })
}
        const newAd = new Ad({
            image:req.file.path,
            publicId:req.file.filename
            
        })
        const savedAd =await newAd.save()
        res.status(201).json({
            success:true,
            data:savedAd
        })
    } catch (error) {
         return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.deleteAd=async(req,res)=>{
    try {
        const deleteAd =await Ad.findByIdAndDelete(req.params.id)
 if (!deleteAd) {
            return res.status(404).json({
                success: false,
                message: "Ad not found"
            })
        }
        res.status(200).json({
            success: true,
            message: "Ad delete successfully",

        })

    } catch (error) {
        console.log(error)
        res.status(error.status || 500).json({
            error:error.message || "Internal server error"
        })
    }
}