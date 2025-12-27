const db = require("../config/db");

async function generateUniqueDesgCode(designationName) {
  // Generate base code
  const words = designationName.trim().toUpperCase().split(/\s+/);

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
    `SELECT designation_code FROM designations WHERE designation_code LIKE $1`,
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
    const match = row.designation_code.match(regex); //was category code
    if (match && match[1]) {
      maxSuffix = Math.max(maxSuffix, parseInt(match[1], 10));
    }
  }
  return `${baseCode}${maxSuffix + 1}`;
}
exports.createDesignation = async (designation_name) => {
  try {
    // Insert new department
    const desgCode = await generateUniqueDesgCode(designation_name);
    const result = await db.query(
      "INSERT INTO designations (designation_name, designation_code) VALUES ($1, $2) RETURNING designation_id, designation_name, designation_code",
      [designation_name, desgCode]
    );
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};
exports.deleteDesignation = async (designation_id) => {
  try {
    // Check for assets assigned to this department
    const assetCheck = await db.query(
      "SELECT COUNT(*) AS cnt FROM assets WHERE designation_id = $1",
      [designation_id]
    );
    if (assetCheck.rows[0].cnt > 0) {
      // Cannot delete, assets exist
      return {
        message: "Can't delete the designation as assets are assigned to it",
      };
    }
    // Delete the department
    const deleteResult = await db.query(
      "DELETE FROM designations WHERE designation_id = $1 RETURNING *",
      [designation_id]
    );
    if (deleteResult.rows.length === 0) {
      return null;
    }
    return deleteResult.rows[0];
  } catch (err) {
    throw err;
  }
};
// List all designations
exports.listAllDesignations = async () => {
  try {
    const { rows } = await db.query(
      "SELECT designation_id, designation_name, designation_code FROM designations ORDER BY designation_name ASC"
    );
    return rows;
  } catch (err) {
    throw err;
  }
};

// Get designation by name (case-insensitive)
exports.findByName = async (designation_name) => {
  try {
    const { rows } = await db.query(
      "SELECT designation_id, designation_name, designation_code FROM designations WHERE LOWER(designation_name) = LOWER($1) LIMIT 1",
      [designation_name]
    );
    return rows[0] || null;
  } catch (err) {
    throw err;
  }
};