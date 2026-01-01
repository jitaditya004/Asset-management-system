const { authenticate } = require("../middlewares/auth");
const ctrl =require("../controllers/historyController");
const express=require("express");
const router=express.Router();


router.get("/:publicId",authenticate,ctrl.listStatusHistory);
router.post("/:publicId",authenticate,ctrl.updateStatus);

module.exports=router;