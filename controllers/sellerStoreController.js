const SellerStore =require('../models/SellerStore')
const User =require('../models/User')
exports.createSellerStore =async(req,res)=>{
    try {

        const vendorId =req.user.userId

        const {storeName,businessDescription,phone,address,city,state,pincode}=req.body

        if(!storeName || !phone || !address || !city || !state || !pincode){
        return res.status(400).json({
            success:false,
            message:"Please fill all required fields"
        })
        }

       
        const existingStore = await SellerStore.findOne({vendorId})

        if(existingStore){
            return res.status(409).json({
                success:false,
                message:"You already have a seller store"
            })
        }

         const sellerStore =await SellerStore.create({
            vendorId,
            storeName,
            businessDescription,
            phone,
            address,
            city,
            state,
            pincode
        })


        return res.status(201).json({
            success:true,
            message:"Seller store created successfully",
            data:sellerStore
        })
    } catch (error) {
       
        console.error("CREATE SELLER STORE ERROR:",error)
         console.log(error.response?.data)
        return res.status(500).json({
            success:false,
            message:"Failed to create seller store"
        })
    }
}
exports.getMySellerStore = async (req, res) => {
    try {
        const vendorId = req.user.userId

        const sellerStore = await SellerStore.findOne({ vendorId })

        if (!sellerStore) {
            return res.status(404).json({
                success: false,
                message: "Seller store not found"
            })
        }

        const user = await User.findById(vendorId).select('role subscription')

        return res.status(200).json({
            success: true,
            data: {
                ...sellerStore.toObject(),
                role: user.role,
                subscription: user.subscription
            }
        })

    } catch (error) {
        console.error("GET SELLER ERROR:", error)

        return res.status(500).json({
            success: false,
            message: "Failed to fetch seller store"
        })
    }
}
exports.acceptSellerTerms = async (req, res) => {
    try {
        const vendorId = req.user.userId

        const sellerStore = await SellerStore.findOneAndUpdate(
            { vendorId },
            {
                termsAccepted: true,
                termsAcceptedAt: new Date()
            },
            { new: true }
        )

        if (!sellerStore) {
            return res.status(404).json({
                success: false,
                message: "Seller store not found"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Seller terms accepted successfully",
            data: sellerStore
        })

    } catch (error) {
        console.error("ACCEPT SELLER TERMS ERROR:", error)

        return res.status(500).json({
            success: false,
            message: "Failed to accept seller terms"
        })
    }
}