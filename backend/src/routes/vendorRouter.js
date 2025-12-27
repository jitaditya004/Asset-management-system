const express = require("express");
const router = express.Router();

const vendorController = require("../controllers/vendorController");
const { authenticate } = require("../middlewares/auth");
const { authorize } = require("../middlewares/rbac");

// ADMIN & ASSET_MANAGER only
router.post(
  "/",
  authenticate,
  authorize("admin", "asset_manager"),
  vendorController.create
);

router.get(
  "/",
  authenticate,
  vendorController.list
);

router.patch(
  "/:id",
  authenticate,
  authorize("admin", "asset_manager"),
  vendorController.update
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin", "asset_manager"),
  vendorController.remove
);

module.exports = router;
