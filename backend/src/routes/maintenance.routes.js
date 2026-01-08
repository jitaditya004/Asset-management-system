const express = require( "express");
const ctrl = require("../controllers/maintenance.controller.js");
const { authenticate } = require("../middlewares/auth.js");
const { authorize } = require("../middlewares/rbac");

const router = express.Router();

router.post("/", authenticate, ctrl.createMaintenance); // user
router.get("/", authenticate, authorize("ADMIN"), ctrl.getAllMaintenance); // admin
router.patch("/:id", authenticate, authorize("ADMIN"), ctrl.updateMaintenance);
router.delete("/:id/cancel",authenticate,ctrl.cancelMaintenance);
router.patch("/:id/reject",authenticate,ctrl.rejectMaintenance);
router.get("/my/all",authenticate,ctrl.getMyMaintenanceRequests);

module.exports= router;
