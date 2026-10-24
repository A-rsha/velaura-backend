const express=require('express')
const productController =require('../controllers/productController')
const authMiddleware = require('../middleware/authMiddleware')
const upload =require('../middleware/uploadMiddleware')
const roleMidleware =require('../middleware/roleMidleware')
const router=express.Router();

router.post('/postProduct',authMiddleware,roleMidleware('admin'),upload.array('images',6),productController.createProduct)
router.get('/getProducts',productController.getAllProduct)
router.get('/getProduct/:id',productController.getProductById)
router.get('/getOfferProduct',productController.getOfferProducts)
router.get('/newArrivals',productController.newArrivals)
router.put('/updateProduct/:id',authMiddleware,roleMidleware('admin'),upload.array('images',6),productController.updateProduct)
router.delete('/deleteProduct/:id',authMiddleware,roleMidleware('admin'),productController.deleteProduct)

module.exports=router;