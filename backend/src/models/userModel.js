// internal modules
const db = require("../config/db");

// helper function
async function getIdByName(table, column, value) {
    let query, params;
    if (table === "departments") {
        query = `SELECT * FROM departments WHERE ${column} = $1`;
        params = [value];
        const result = await db.query(query, params);
        if (result.rows.length > 0) {
            return {
                department_id: result.rows[0].department_id,
                department_code: result.rows[0].department_code
            };
        } else {
            return null;
        }
    } else {
        // For other tables, just return id (e.g. designations_id, roles_id)
        query = `SELECT ${table.slice(0, -1)}_id AS id FROM ${table} WHERE ${column} = $1`;
        params = [value];
        const result = await db.query(query, params);
        if (result.rows.length > 0) {
            return result.rows[0].id;
        } else {
            return null;
        }
    }
}//problem department id is not being inserted

// create a new user - ALWAYS registers with role 'USER' (never accepts role from client)
exports.createUser = async (name, email, passwordHash, phone, designationName, departmentName) => {
    // insert the user into the database
    const result = await getIdByName("departments", "department_name", departmentName); 
    if(!result){
        throw new Error("department does not exist");
    }
    const {department_id, department_code} = result;
    // Handle optional designation - if "NO DESIGNATION", set designation_id to null
    let designation_id = null;
    if (designationName && designationName !== "NO DESIGNATION") {
        designation_id = await getIdByName("designations", "designation_name", designationName);
        // If designation doesn't exist, throw error
        if (!designation_id) {
            throw new Error(`Designation "${designationName}" not found`);
        }
    }
    // ALWAYS set role to 'USER' - never accept role from client input
    const role_id = await getIdByName("roles", "role_name", "USER");

    let client=await db.pool.connect();
    client.on("error", () => {});

    try {
        await client.query("BEGIN");
        const result = await client.query(
            `INSERT INTO users (full_name, email, password_hash, department_id, designation_id, phone)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING user_id, full_name, email`,
            [name, email, passwordHash, department_id, designation_id, phone]
        );
    
        const newUser = result.rows[0];
        const newUserPublicId = `USR-${department_code}-${String(newUser.user_id).padStart(6, '0')}`;
    
        // update db and set public_id
        await client.query(
            `UPDATE users SET public_id = $1 WHERE user_id = $2`,
            [newUserPublicId, newUser.user_id]
        );
        
        await client.query(
            `INSERT INTO user_roles (user_id, role_id)
            VALUES ($1, $2)`,
            [newUser.user_id, role_id]
        );

        await client.query("COMMIT");
    
        return {
            ...newUser,
            public_id : newUserPublicId,
        };
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    }finally{
        client.release();
    }
}

// get a user by email
exports.getUserByEmail = async (email) => {
    // get the user from the database
    try {
        const result = await db.query(
            `SELECT 
                u.user_id,
                u.public_id,  
                u.full_name,
                u.email,
                u.department_id,
                d.department_name,
                g.designation_name,
                r.role_name,
                u.password_hash
             FROM users u
             LEFT JOIN departments d ON u.department_id = d.department_id
             LEFT JOIN designations g ON u.designation_id = g.designation_id
             LEFT JOIN user_roles ur ON u.user_id = ur.user_id
             LEFT JOIN roles r ON ur.role_id = r.role_id
             WHERE u.email = $1`,
            [email]
        );
        return result.rows[0];
    } catch (error) {
        throw error;
    }
}

// get a user by user_id (internal id)
exports.getUserById = async (user_id) => {
    try {
        const result = await db.query(
            `SELECT 
                u.user_id,
                u.public_id,
                u.full_name,
                u.email,
                u.department_id,
                d.department_name,
                g.designation_name,
                r.role_name,
                u.password_hash
             FROM users u
             LEFT JOIN departments d ON u.department_id = d.department_id
             LEFT JOIN designations g ON u.designation_id = g.designation_id
             LEFT JOIN user_roles ur ON u.user_id = ur.user_id
             LEFT JOIN roles r ON ur.role_id = r.role_id
             WHERE u.user_id = $1`,
            [user_id]
        );
        return result.rows[0];
    } catch (error) {
        throw error;
    }
}

// get a user by public_id
exports.getUserByPublicId = async (public_id) => {
    try {
        const result = await db.query(
            `SELECT 
                u.user_id,
                u.public_id,
                u.full_name,
                u.email,
                u.department_id,
                d.department_name,
                g.designation_name,
                r.role_name,
                u.password_hash
             FROM users u
             LEFT JOIN departments d ON u.department_id = d.department_id
             LEFT JOIN designations g ON u.designation_id = g.designation_id
             LEFT JOIN user_roles ur ON u.user_id = ur.user_id
             LEFT JOIN roles r ON ur.role_id = r.role_id
             WHERE u.public_id = $1`,
            [public_id]
        );
        return result.rows[0];
    } catch (error) {
        throw error;
    }
}
// Update user details
exports.updateUserById = async (user_id, updateFields) => {
    // updateFields is an object with key-value pairs to be updated
    // Only allow specific fields to be updated
    const allowedFields = ["name", "email", "department_id", "designation_id"];
    const setParts = [];
    const values = [];
    let idx = 1;

    for (let key of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(updateFields, key)) {
            setParts.push(`${key} = $${idx}`);
            values.push(updateFields[key]);
            idx++;
        }
    }

    if (setParts.length === 0) {
        throw new Error("No valid fields provided for update.");
    }

    values.push(user_id);

    const query = `
        UPDATE users
        SET ${setParts.join(", ")}
        WHERE user_id = $${idx}
        RETURNING *;
    `;

    try {
        const result = await db.query(query, values);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

// Update password by email (for password reset)
exports.updatePasswordByEmail = async (email, passwordHash) => {
    try {
        const result = await db.query(
            `UPDATE users 
             SET password_hash = $1 
             WHERE email = $2 
             RETURNING user_id, email`,
            [passwordHash, email]
        );
        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

// Promote a USER to ASSET_MANAGER
// Enforces: Only one ASSET_MANAGER per department (database constraint)
exports.promoteToAssetManager = async (user_id) => {
    try {
        await db.query("BEGIN"); //change it to pool.connect , later

        // Get user details
        const user = await exports.getUserById(user_id);
        if (!user) {
            throw new Error("User not found");
        }

        // Check if user is already ASSET_MANAGER
        if (user.role_name === "ASSET_MANAGER") {
            throw new Error("User is already an ASSET_MANAGER");
        }

        // Check if user is not USER role
        if (user.role_name !== "USER") {
            throw new Error("Only USER role can be promoted to ASSET_MANAGER");
        }

        // Check if department already has an ASSET_MANAGER
        const existingManager = await db.query(
            `SELECT u.user_id 
             FROM users u
             JOIN user_roles ur ON u.user_id = ur.user_id
             JOIN roles r ON ur.role_id = r.role_id
             WHERE u.department_id = $1 AND r.role_name = 'ASSET_MANAGER'`,
            [user.department_id]
        );

        if (existingManager.rows.length > 0 && existingManager.rows[0].user_id !== user_id) {
            throw new Error("This department already has an ASSET_MANAGER");
        }

        // Get ASSET_MANAGER role_id
        const assetManagerRoleId = await getIdByName("roles", "role_name", "ASSET_MANAGER");
        if (!assetManagerRoleId) {
            throw new Error("ASSET_MANAGER role not found in database");
        }

        // Update user role from USER to ASSET_MANAGER
        // First, get current USER role_id
        const userRoleId = await getIdByName("roles", "role_name", "USER");
        
        // Delete old USER role
        await db.query(
            "DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2",
            [user_id, userRoleId]
        );

        // Insert new ASSET_MANAGER role
        await db.query(
            "INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)",
            [user_id, assetManagerRoleId]
        );

        await db.query("COMMIT");

        // Return updated user
        return await exports.getUserById(user_id);
    } catch (error) {
        await db.query("ROLLBACK");
        throw error;
    }
};

// Delete user by id
exports.deleteUserById = async (user_id) => {
    try {
        // Clean up related records first, if necessary, e.g., user_roles
        await db.query("DELETE FROM user_roles WHERE user_id = $1", [user_id]);
        // Delete user
        const result = await db.query(
            "DELETE FROM users WHERE user_id = $1 RETURNING *",
            [user_id]
        );
        return result.rows[0]; // Return deleted user info
    } catch (error) {
        throw error;
    }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT 
        u.user_id,
        u.public_id,
        u.full_name,
        u.email,
        u.phone,
        u.is_active,
        u.created_at,

        d.department_name,
        g.designation_name,
        r.role_name

      FROM users u
      LEFT JOIN departments d 
        ON u.department_id = d.department_id
      LEFT JOIN designations g 
        ON u.designation_id = g.designation_id
      LEFT JOIN user_roles ur 
        ON u.user_id = ur.user_id
      LEFT JOIN roles r 
        ON ur.role_id = r.role_id

      ORDER BY u.created_at DESC
    `);

    return result;
  } catch (err) {
    throw err;
  }
};
