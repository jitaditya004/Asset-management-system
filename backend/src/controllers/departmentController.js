const departmentModel = require("../models/departmentModel");

// Create a new department
exports.create = async (req, res, next) => {
    try {
        const { department_name } = req.body;
        if (!department_name || !department_name.trim()) {
            return res.status(400).json({ error: "Department name is required" });
        }

        // Check if department already exists (case-insensitive)
        // You may need to adjust field/column names based on your database schema
        const existing = await departmentModel.findByName(department_name.trim());
        if (existing) {
            return res.status(409).json({ error: "Department already exists" });
        }

        const department = await departmentModel.createDepartment(department_name.trim());
        res.status(201).json(department);
    } catch (err) {
        next(err);
    }
};

// Delete a department by id
exports.delete = async (req, res, next) => {
    try {
        const { department_id } = req.params;
        if (!department_id) {
            return res.status(400).json({ error: "Department id is required" });
        }

        const result = await departmentModel.deleteDepartment(department_id);
        if (!result) {
            return res.status(404).json({ error: "Department not found" });
        }
        if (result && result.message) {
            // Cannot delete due to assigned assets
            return res.status(409).json({ error: result.message });
        }
        res.json({ message: "Department deleted successfully", department: result });
    } catch (err) {
        next(err);
    }
};
// List all departments
exports.listAll = async (req, res, next) => {
    try {
        const departments = await departmentModel.listAllDepartments();
        res.json(departments);
    } catch (err) {
        next(err);
    }
};
