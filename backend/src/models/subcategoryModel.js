const db = require("../config/db");

async function generateUniqueSubcatCode(subCategoryName) {
  // Generate base code
  const words = subCategoryName.trim().toUpperCase().split(/\s+/);

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
    `SELECT subcategory_code FROM sub_categories WHERE subcategory_code LIKE $1`,
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
    const match = row.subcategory_code.match(regex);
    if (match && match[1]) {
      maxSuffix = Math.max(maxSuffix, parseInt(match[1], 10));
    }
  }
  return `${baseCode}${maxSuffix + 1}`;
}

// Create a new subcategory
exports.addSubcategory = async (data) => {
  console.log(data);
    try {
        const subCatCode = await generateUniqueSubcatCode(data.subcategory_name);
        const result = await db.query(
          "INSERT INTO sub_categories (category_id, subcategory_name,subcategory_code, description) VALUES ($1, $2, $3,$4) RETURNING subcategory_name, subcategory_code",
          [data.category_id, data.subcategory_name, subCatCode, data.description || "No description"]
        );
        return result.rows[0];
      } catch (err) {
        throw err;
      }
};

// Update a subcategory's description only
exports.updateSubcategoryDescription = async (id, newDescription) => {
  try {
    const result = await db.query(
      "UPDATE sub_categories SET description = $1 WHERE subcategory_id = $2 RETURNING subcategory_name, subcategory_code, description",
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

// Delete a subcategory, only if no asset is present under this subcategory
exports.deleteSubcategory = async (id) => {
  try {
    const result = await db.query(
      "SELECT COUNT(*) AS cnt FROM assets WHERE subcategory_id = $1",
      [id]
    );
    if (result.rows[0].cnt > 0) {
      // Cannot delete, assets exist
      return {
        message: "Can't delete the subcategory as assets are assigned to it",
      };
    }
    const deleteSql = await db.query(
      "DELETE FROM sub_categories WHERE subcategory_id = $1 RETURNING *",
      [id]
    );
    return deleteSql.rows[0];
  } catch (error) {
    throw error;
  }
};

// List all subcategories
exports.listAllSubcategories = async () => {
  try {
    const result = await db.query("SELECT * FROM sub_categories ORDER BY subcategory_name ASC");
    return result.rows;
  } catch (error) {
    throw error;
  }
};

// Retrieve a subcategory by its name
exports.getByNameAndCategory = async (subcategory_name, category_id) => {
  try {
    const result = await db.query(
      "SELECT * FROM sub_categories WHERE LOWER(subcategory_name) = LOWER($1) AND category_id = $2",
      [subcategory_name, category_id]
    );
    if (result.rows.length === 0) {
      return null;
    }
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

exports.getSubcategoriesByCategory = async (category_id) => {
  try {
    const result = await db.query(
      "SELECT * FROM sub_categories WHERE category_id = $1 ORDER BY subcategory_name ASC",
      [category_id]
    );
    return result.rows;
  } catch (error) {
    throw error;
  }
};
