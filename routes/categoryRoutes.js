const express= require('express')
const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMidleware')
const upload =require('../middleware/uploadMiddleware')
const categoryController =require('../controllers/categoryController')
const router=express.Router()


router.post('/create',authMiddleware,roleMiddleware('admin'),upload.single('image'),categoryController.createCategory)

router.get('/getCategories',categoryController.getAllCategories)
router.get('/getOneCategory/:id',categoryController.getCategoryById)
router.put('/updateCategory/:id',authMiddleware,roleMiddleware('admin'),upload.single('image'),categoryController.updateCategories)
router.delete('/deleteCategory/:id',authMiddleware,roleMiddleware("admin"),categoryController.deleteCategories)
module.exports=router