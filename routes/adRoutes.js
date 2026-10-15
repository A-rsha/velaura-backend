const express= require('express')
const adController =require('../controllers/adController')
const authMiddleware =require('../middleware/authMiddleware')
const upload =require('../middleware/uploadMiddleware')
const router=express.Router();

router.get('/getAds',adController.getAds)
router.post('/addAds',authMiddleware,upload.single('image'),adController.addAds)
router.delete('/deleteAd/:id',adController.deleteAd)
module.exports=router;