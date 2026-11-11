const express= require('express')
const adminController =require('../controllers/adminController')
const authMiddleware =require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMidleware')
const router=express.Router();

router.get('/vendors',authMiddleware,roleMiddleware('admin'),adminController.getAllVendors)

module.exports =router;