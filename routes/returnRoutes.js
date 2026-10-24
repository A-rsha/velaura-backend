
const express = require("express");
const router = express.Router();

const {
    requestReturn,
    getAllReturns,
    getMyReturns,
    updateReturnStatus
} = require("../controllers/returnController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware =require("../middleware/roleMidleware")

router.post("/requestReturn", authMiddleware, requestReturn);
router.get("/getAllReturns",authMiddleware,getAllReturns)

router.get("/getMyReturns", authMiddleware, getMyReturns);
router.put('/updateReturnStatus/:id',authMiddleware,roleMiddleware("admin"),updateReturnStatus)

module.exports = router;

