const SellerStore = require("../models/SellerStore");
const User = require("../models/User");

exports.getAllVendors =async(req,res)=>{
    try {
         const vendors =await User.find({role:'vendor'})
         .select('-password -refreshToken')
         .sort({createdAt: -1})
         .lean()

          const vendorIds = vendors.map(vendor => vendor._id)

        const stores = await SellerStore.find({
            vendorId: { $in: vendorIds }
        }).lean()

           const storeMap = new Map(
            stores.map(store => [
                store.vendorId.toString(),
                store
            ])
        )

        const vendorList =vendors.map(vendor =>{
            const store =storeMap.get(vendor._id.toString())

            let subscriptionStatus =vendor.subscription?.status || 'inactive'

            if(
                subscriptionStatus === 'active' &&
                vendor.subscription?.endDate &&
                new Date(vendor.subscription.endDate) < new Date()
            ){
                subscriptionStatus = 'expired'
            }

            return {
                _id: vendor._id,
                name: vendor.name,
                email: vendor.email,
                createdAt: vendor.createdAt,

                store: store || null,

                subscription: {
                    plan: vendor.subscription?.plan || null,
                    status: subscriptionStatus,
                    startDate: vendor.subscription?.startDate || null,
                    endDate: vendor.subscription?.endDate || null
                }
            }
        })
        return res.status(200).json({
            success: true,
            count: vendorList.length,
            vendors: vendorList
        })
    } catch (error) {

         console.error('Get Vendors Error:', error)

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch vendors'
        })
        
    }
}