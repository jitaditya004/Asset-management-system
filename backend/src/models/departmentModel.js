const db = require("../config/db");

async function generateUniqueDeptCode(departmentName) {
  // Generate base code
  const words = departmentName.trim().toUpperCase().split(/\s+/);  

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
    `SELECT department_code FROM departments WHERE department_code LIKE $1`,
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
    const match = row.department_code.match(regex);
    if (match && match[1]) {
      maxSuffix = Math.max(maxSuffix, parseInt(match[1], 10));
    }
  }
  return `${baseCode}${maxSuffix + 1}`;
}
exports.createDepartment = async (department_name) => {
  try {
    // Insert new department
    const deptCode = await generateUniqueDeptCode(department_name);//pls await
    const result = await db.query(
      "INSERT INTO departments (department_name, department_code) VALUES ($1, $2) RETURNING department_id, department_name, department_code",
      [department_name, deptCode]
    );
    return result.rows[0];
  } catch (err) {
    throw err;
  }
};
exports.deleteDepartment = async (department_id) => {
  try {
    // Check for assets assigned to this department
    const assetCheck = await db.query(
      "SELECT COUNT(*) AS cnt FROM assets WHERE department_id = $1",
      [department_id]
    );
    if (assetCheck.rows[0].cnt > 0) {
      // Cannot delete, assets exist
      return {
        message: "Can't delete the department as assets are assigned to it",
      };
    }
    // Delete the department
    const deleteResult = await db.query(
      "DELETE FROM departments WHERE department_id = $1 RETURNING *",
      [department_id]
    );
    if (deleteResult.rows.length === 0) {
      return null;
    }
    return deleteResult.rows[0];
  } catch (err) {
    throw err;
  }
};
// List all departments
exports.listAllDepartments = async () => {
  try {
    const { rows } = await db.query(
      "SELECT department_id, department_name, department_code FROM departments ORDER BY department_name"
    );
    return rows;
  } catch (err) {
    throw err;
  }
};

// Get department by name (case-insensitive)
exports.findByName = async (department_name) => {
  try {
    const { rows } = await db.query(
      "SELECT department_id, department_name, department_code FROM departments WHERE LOWER(department_name) = LOWER($1) LIMIT 1",
      [department_name]
    );
    
    return rows[0] || null;
  } catch (err) {
    throw err;
  }
};
