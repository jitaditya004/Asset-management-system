const db = require("../config/db");

async function generateUniqueCatCode(categoryName) {
  // Generate base code
  const words = categoryName.trim().toUpperCase().split(/\s+/);

  let baseCode;
  if (words.length > 1) {
    baseCode = words
      .map((w) => w[0])
      .join("")
      .slice(0, 3);
  } else {
    baseCode = words[0].slice(0, 3);
  }

  // Fetch existing codes
  const { rows } = await db.query(
    `SELECT category_code FROM asset_categories WHERE category_code LIKE $1`,
    [`${baseCode}%`]
  );

  // If no conflict → return baseCode
  if (rows.length === 0) {
    return baseCode;
  }
  // If conflict
  // Find max numeric suffix
  let maxSuffix = 1;
  const regex = new RegExp(`^${baseCode}(\\d+)?$`); // RegExp to match baseCode and find max suffix

  for (const row of rows) {
    const match = row.category_code.match(regex);
    if (match && match[1]) {
      maxSuffix = Math.max(maxSuffix, parseInt(match[1], 10));
    }
  }
  return `${baseCode}${maxSuffix + 1}`;
}

// Add a new category
exports.addCategory = async (data) => {
  try {
    const catCode = await generateUniqueCatCode(data.category_name);
    const result = await db.query(
      "INSERT INTO asset_categories (category_name, category_code, description) VALUES ($1, $2, $3) RETURNING category_name, category_code",
      [data.category_name, catCode, data.description || "No description"]
    );
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};

// Update a category's description only
exports.updateCategoryDescription = async (id, newDescription) => {
  try {
    const result = await db.query(
      "UPDATE asset_categories SET description = $1 WHERE category_id = $2 RETURNING category_name, category_code, description",
      [newDescription, id]
    );
    if (result.rows.length === 0) {
      return null;
    }
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

// Delete a category, only if no asset is present under this category
exports.deleteCategory = async (id) => {
  // First, check if there are assets under this category
  try {
    const result = await db.query(
      "SELECT COUNT(*) AS cnt FROM assets WHERE category_id = $1",
      [id]
    );
    if (result.rows[0].cnt > 0) {
      // Cannot delete, assets exist
      return {
        message: "Can't delete the category as assets are assigned to it",
      };
    }
    // No assets
    const deleteSql = await db.query(
      "DELETE FROM asset_categories WHERE category_id = $1 RETURNING *",
      [id]
    );

    return deleteSql.rows[0];
  } catch (error) {
    throw error;
  }
};

// List all category details such as name, code and description
exports.listAllCategories = async () => {
  try {
    const result = await db.query(
      "SELECT * FROM asset_categories ORDER BY category_name ASC"
    );
    return result.rows;
  } catch (error) {
    throw error;
  }
};

exports.getCategoryByName = async (category_name) => {
  try {
    const result = await db.query(
      "SELECT * FROM asset_categories WHERE LOWER(category_name) = LOWER($1)",
      [category_name]
    );
    if (result.rows.length === 0) {
      return null;
    }
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};
