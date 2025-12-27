// external modules
const express = require("express");
const router = express.Router();
// internal modules
const categoryController = require("../controllers/categoryController");
const { authenticate } = require("../middlewares/auth");
const { authorize } = require("../middlewares/rbac");

router.post("/", authenticate, authorize("admin"), categoryController.create);
router.patch("/:id/description", authenticate, authorize("admin"), categoryController.updateDesc);
router.delete("/:id", authenticate, authorize("admin"), categoryController.delete);
router.get("/", authenticate, categoryController.list);

module.exports = router;
