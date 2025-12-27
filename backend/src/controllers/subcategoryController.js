const subcategoryModel = require("../models/subcategoryModel");

// Create a new subcategory
exports.create = async (req, res, next) => {
    
    try {
        const { subcategory_name, description, category_id } = req.body;
        console.log(req.body);

        // Validate required fields
        if (!subcategory_name || !category_id) {
            return res.status(400).json({ error: "Missing required subcategory name or category." });
        }

        // Check if subcategory already exists for the given category
        const existing = await subcategoryModel.getByNameAndCategory(subcategory_name, category_id);
        if (existing) {
            return res.status(409).json({ error: "Subcategory already exists in the specified category." });
        }

        const payload = { subcategory_name, description, category_id };
        const created = await subcategoryModel.addSubcategory(payload);
        res.status(201).json(created);
    } catch (error) {
        next(error);
    }
};

// Update description for a subcategory
exports.updateDesc = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { description } = req.body;

        if (!description) {
            return res.status(400).json({ error: "Missing required subcategory description." });
        }

        const updated = await subcategoryModel.updateSubcategoryDescription(id, description);
        if (!updated) {
            return res.status(404).json({ error: "Subcategory not found" });
        }

        res.json(updated);
    } catch (error) {
        next(error);
    }
};

// Delete a subcategory
exports.delete = async (req, res, next) => {
    try {
        const id = req.params.id;

        const deleted = await subcategoryModel.deleteSubcategory(id);
        if (!deleted) {
            return res.status(404).json({ error: "Subcategory not found" });
        }
        if (deleted && deleted.message) {
            // Cannot delete due to assigned assets
            return res.status(409).json({ error: deleted.message });
        }
        res.json(deleted);
    } catch (error) {
        next(error);
    }
};

// List all subcategories
exports.list = async (req, res, next) => {
    try {
        const subcategories = await subcategoryModel.listAllSubcategories();
        res.json(subcategories);
    } catch (error) {
        next(error);
    }
};

// List subcategories by category
exports.listByCategory = async (req, res, next) => {
    try {
        const categoryId = req.params.categoryId;
        if (!categoryId) {
            return res.status(400).json({ error: "Missing category_id in parameters." });
        }
        const subcategories = await subcategoryModel.getSubcategoriesByCategory(categoryId);
        res.json(subcategories);
    } catch (error) {
        next(error);
    }
};