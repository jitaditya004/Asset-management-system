const categoryModel = require("../models/categoryModel");

exports.create = async (req, res, next) => {
    try {
        // Check if category already exists
        const {category_name, description} = req.body;
        const existing = await categoryModel.getCategoryByName(category_name); 
        if (existing) {
            return res.status(409).json({ error: "Category already exists" });
        }
        if(!category_name){
            return res.status(400).json({ error: "Missing required category details" });
        }
        const payload = {
            category_name, description
        }
        const cat = await categoryModel.addCategory(payload);
        res.status(201).json(cat);
    } catch (error) {
        next(error);
    }
};

exports.updateDesc = async (req, res, next) => {
    try {
        const id = req.params.id;
        const newDesc = req.body.description;
        if(!newDesc){
            return res.status(400).json({ error: "Missing required category description." });
        }
        const cat = await categoryModel.updateCategoryDescription(id, newDesc);
        if (!cat) return res.status(404).json({ error: "Category not found" });
        res.json(cat);
    } catch (error) {
        next(error);
    }
};

exports.delete = async (req, res, next) => {
    try {
        const id = req.params.id;
        const cat = await categoryModel.deleteCategory(id);
        if (!cat) return res.status(404).json({ error: "Category not found" });
        if (cat && cat.message) {
            // Cannot delete due to assigned assets
            return res.status(409).json({ error: cat.message });
        }
        res.json(cat);
    } catch (error) {
        next(error);
    }
};

exports.list = async (req, res, next) => {
    try {
    const categories = await categoryModel.listAllCategories();
    res.json(categories);
    } catch (error) {
        next(error);
    }
};