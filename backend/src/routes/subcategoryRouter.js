// external modules
const express = require("express");
const router = express.Router();
// internal modules
const subcategoryController = require("../controllers/subcategoryController");
const { authenticate } = require("../middlewares/auth");
const { authorize } = require("../middlewares/rbac");

router.post("/", authenticate, authorize("admin"), subcategoryController.create);
router.patch("/:id/description", authenticate, authorize("admin"), subcategoryController.updateDesc);
router.delete("/:id", authenticate, authorize("admin"), subcategoryController.delete);
router.get("/", authenticate, subcategoryController.list);
router.get("/by-category/:categoryId", authenticate, subcategoryController.listByCategory);

module.exports = router;