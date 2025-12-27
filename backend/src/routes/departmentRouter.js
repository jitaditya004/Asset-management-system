const express = require("express");
const router = express.Router();

const departmentController = require("../controllers/departmentController");

// Create a new department
router.post("/", departmentController.create);

// Delete a department by id
router.delete("/:department_id", departmentController.delete);

// List all departments
router.get("/", departmentController.listAll);

module.exports = router;
