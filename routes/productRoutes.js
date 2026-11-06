const express=require('express')
const productController =require('../controllers/productController')
const authMiddleware = require('../middleware/authMiddleware')
const upload =require('../middleware/uploadMiddleware')
const roleMidleware =require('../middleware/roleMidleware')
const vendorSubscriptionMiddleware = require('../middleware/vendorSubscriptionMiddleware')
const router=express.Router();

router.post('/postProduct',authMiddleware,roleMidleware('admin', 'vendor'),vendorSubscriptionMiddleware,upload.array('images',6),productController.createProduct)
router.get('/getProducts',productController.getAllProduct)
router.get('/getProduct/:id',productController.getProductById)
router.get('/getOfferProduct',productController.getOfferProducts)
router.get('/newArrivals',productController.newArrivals)
router.get(
    '/myProducts',
    authMiddleware,
    roleMidleware('vendor'),
    productController.getMyVendorProducts
)
router.put('/updateProduct/:id',authMiddleware,roleMidleware('admin', 'vendor'),vendorSubscriptionMiddleware,upload.array('images',6),productController.updateProduct)
router.delete('/deleteProduct/:id',authMiddleware,roleMidleware('admin', 'vendor'),vendorSubscriptionMiddleware,productController.deleteProduct)

module.exports=router;