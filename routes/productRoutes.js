const express=require('express')
const productController =require('../controllers/productController')
const authMiddleware = require('../middleware/authMiddleware')
const upload =require('../middleware/uploadMiddleware')
const roleMidleware =require('../middleware/roleMidleware')
const router=express.Router();

router.post('/postProduct',authMiddleware,roleMidleware('admin'),upload.single('image'),productController.createProduct)
router.get('/getProducts',authMiddleware,productController.getAllProduct)
router.get('/getProduct/:id',authMiddleware,productController.getProductById)
router.put('/updateProduct/:id',authMiddleware,roleMidleware('admin'),productController.updateProduct)
router.delete('/deleteProduct/:id',authMiddleware,roleMidleware('admin'),productController.deleteProduct)

module.exports=router;