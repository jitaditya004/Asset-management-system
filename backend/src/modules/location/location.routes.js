const express=require("express");
const router=express.Router();
const ctrl=require("./location.controller");
const {authenticate}=require("../../middlewares/auth");

router.get("/",authenticate,ctrl.getLocations);
router.get("/:id",authenticate,ctrl.getLocationById);
router.post("/",authenticate,ctrl.updateLocation);
router.delete("/:id",authenticate,ctrl.deleteLocation);

module.exports=router;