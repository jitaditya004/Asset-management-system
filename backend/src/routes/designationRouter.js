const express = require("express");
const router = express.Router();

const designationController = require("../controllers/designationController");

// Create a new designation
router.post("/", designationController.create);

// Delete a designation by id
router.delete("/:designation_id", designationController.delete);

// List all designations
router.get("/", designationController.listAll);

module.exports = router;