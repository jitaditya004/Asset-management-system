// external modules
const express = require("express");
// internal modules
const userController = require("../controllers/userController");
const { authenticate } = require("../middlewares/auth");
const { authorize } = require("../middlewares/rbac");

const router = express.Router();
// Route to get info about current logged-in user
router.get("/me", authenticate, userController.me);

router.get("/",authenticate,authorize("admin"),userController.getAllUser);
router.patch("/:user_id",authenticate,authorize("admin"),userController.updateUser);
router.delete("/:userId",authenticate,authorize("admin"),userController.deleteUser);

// Promote USER to ASSET_MANAGER (admin only)
router.patch("/:userId/promote", authenticate, authorize("admin"), userController.promoteToAssetManager);

module.exports = router;
