const db = require("../config/db");
const withTransaction=require("../config/withTransaction");

/**
 * USER: Report issue
 */
exports.createMaintenance = async (req, res, next) => {
  try {
    const maintenanceId = await withTransaction(async (client) => {
      const { asset_id, issue_description } = req.body;
      const userId = req.user.user_id;

      const existing = await client.query(
        `SELECT 1 FROM maintenance_requests
         WHERE asset_id = $1
           AND status IN ('OPEN', 'IN_PROGRESS')
         FOR UPDATE`,
        [asset_id]
      );

      if (existing.rowCount > 0) {
        throw new Error("ACTIVE_MAINTENANCE_EXISTS");
      }

      const result = await client.query(
        `INSERT INTO maintenance_requests
         (asset_id, reported_by, issue_description, status)
         VALUES ($1, $2, $3, 'OPEN')
         RETURNING maintenance_id`,
        [asset_id, userId, issue_description]
      );

      await client.query(
        `UPDATE assets
         SET status = 'OPEN', maintenance_id = $2
         WHERE asset_id = $1`,
        [asset_id, result.rows[0].maintenance_id]
      );

      return result.rows[0].maintenance_id;
    });

    res.status(201).json({
      message: "Repair request created",
      maintenance_id: maintenanceId,
    });
  } catch (err) {
    if (err.message === "ACTIVE_REPAIR_EXISTS") {
      return res.status(409).json({ message: "Asset already under maintenance" });
    }
    next(err);
  }
};



exports.acceptMaintenance = async (req, res, next) => {
  const { id } = req.params;
  const reviewerId = req.user.user_id;

  const client = await db.pool.connect();
    client.on("error", (err) => {
    console.error("PG client error (auto-handled):", err);
  });


  try {
    await client.query("BEGIN");

    // 1️⃣ Update maintenance request
    const result = await client.query(
      `UPDATE maintenance_requests
       SET status = 'IN_PROGRESS',
           reviewed_by = $2,
           reviewed_at = NOW(),
           priority= $3
       WHERE maintenance_id = $1
         AND status = 'OPEN'
       RETURNING asset_id`,
      [id, reviewerId,'MEDIUM']
    );

    if (result.rowCount === 0) {
      throw new Error("Invalid maintenance request or already processed");
    }

    const { asset_id } = result.rows[0];

    // 2️⃣ Update asset status
    await client.query(
      `UPDATE assets
       SET status = 'IN_REPAIR'
       WHERE asset_id = $1`,
      [asset_id]
    );

    await client.query("COMMIT");

    res.json({ message: "Maintenance accepted successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
};



exports.assignTechnician = async (req, res, next) => {
  const { id } = req.params;
  const { assigned_vendor } = req.body;

  try {
    await db.query(
      `UPDATE maintenance_requests
       SET assigned_vendor = $1
       WHERE maintenance_id = $2 AND status = 'IN_PROGRESS'`,
      [assigned_vendor, id]
    );

    res.json({ message: "Technician assigned" });
  } catch (err) {
    next(err);
  }
};

exports.completeMaintenance = async (req, res, next) => {
  const { id } = req.params;

  const client = await db.pool.connect();
    client.on("error", (err) => {
    console.error("PG client error (auto-handled):", err);
  });


  try {
    await client.query("BEGIN");

    // 1️⃣ Complete maintenance (ONLY if IN_PROGRESS)
    const result = await client.query(
      `UPDATE maintenance_requests
       SET status = 'COMPLETED',
           completed_at = NOW()
       WHERE maintenance_id = $1
         AND status = 'IN_PROGRESS'
       RETURNING asset_id`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({
        message: "Repair cannot be completed"
      });
    }

    const { asset_id } = result.rows[0];

    // 2️⃣ Restore asset + unlink maintenance
    await client.query(
      `UPDATE assets
       SET status = 'ACTIVE',
           maintenance_id = NULL
       WHERE asset_id = $1`,
      [asset_id]
    );

    await client.query("COMMIT");

    res.json({ message: "Repair completed successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
};




/**
 * ADMIN: View queue
 */
exports.getAllMaintenance = async (req, res) => {
  try{
        const result = await db.query(
        `SELECT m.*, a.asset_name, u.full_name AS reported_by_name, u2.full_name AS reviewed_by_name
        FROM maintenance_requests m
        JOIN assets a ON a.asset_id = m.asset_id
        JOIN users u ON u.user_id = m.reported_by
        LEFT JOIN users u2 ON u2.user_id = m.reviewed_by
        ORDER BY m.created_at DESC`
        );

        res.json(result.rows);
    }catch(err){
        next(err);
    }
};

/**
 * ADMIN: Update maintenance
 */
exports.updateMaintenance = async (req, res, next) => {
  const { id } = req.params;
  const { status, priority, assigned_vendor } = req.body;

  const client = await db.pool.connect();
    client.on("error", (err) => {
    console.error("PG client error (auto-handled):", err);
  });


  try {
    await client.query("BEGIN");

    // 1️⃣ Update maintenance
    const result = await client.query(
      `
      UPDATE maintenance_requests
      SET status = COALESCE($1, status),
          priority = COALESCE($2, priority),
          assigned_vendor = COALESCE($3, assigned_vendor),
          completed_at = CASE 
            WHEN $1 = 'COMPLETED' THEN NOW() 
            ELSE completed_at 
          END
      WHERE maintenance_id = $4
      RETURNING asset_id, status
      `,
      [status, priority, assigned_vendor, id]
    );

    if (result.rowCount === 0) {
      throw new Error("Maintenance request not found");
    }

    const { asset_id } = result.rows[0];

    // 2️⃣ Sync asset lifecycle (ONLY when completed)
    if (status === "COMPLETED") {
      await client.query(
        `
        UPDATE assets
        SET status = 'ACTIVE',
            maintenance_id = NULL
        WHERE asset_id = $1
        `,
        [asset_id]
      );
    }

    await client.query("COMMIT");

    res.json({ message: "Maintenance updated successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
};



exports.cancelMaintenance = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.user_id;

  const client = await db.pool.connect();
    client.on("error", (err) => {
    console.error("PG client error (auto-handled):", err);
  });


  try {
    await client.query("BEGIN");

    // 1️⃣ Cancel maintenance (ONLY if OPEN and owned by user)
    const result = await client.query(
      `UPDATE maintenance_requests
       SET status = 'CANCELLED',
           cancelled_at = NOW()
       WHERE maintenance_id = $1
         AND status = 'OPEN'
         AND reported_by = $2
       RETURNING asset_id`,
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({
        message: "Cannot cancel this maintenance request"
      });
    }

    const { asset_id } = result.rows[0];

    // 2️⃣ Restore asset lifecycle + unlink maintenance
    await client.query(
      `UPDATE assets
       SET status = 'ACTIVE',
           maintenance_id = NULL
       WHERE asset_id = $1`,
      [asset_id]
    );

    await client.query("COMMIT");

    res.json({ message: "Maintenance request cancelled successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
};



exports.rejectMaintenance = async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body; // optional
  const adminId = req.user.user_id;

  const client = await db.pool.connect();
    client.on("error", (err) => {
    console.error("PG client error (auto-handled):", err);
  });


  try {
    await client.query("BEGIN");

    // 1️⃣ Reject ONLY OPEN maintenance
    const result = await client.query(
      `UPDATE maintenance_requests
       SET status = 'REJECTED',
           rejected_at = NOW(),
           rejection_reason = $2,
           reviewed_by = $3
       WHERE maintenance_id = $1
         AND status = 'OPEN'
       RETURNING asset_id`,
      [id, reason || null, adminId]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({
        message: "Maintenance cannot be rejected"
      });
    }

    const { asset_id } = result.rows[0];

    // 2️⃣ Restore asset lifecycle
    await client.query(
      `UPDATE assets
       SET status = 'ACTIVE',
           maintenance_id = NULL
       WHERE asset_id = $1`,
      [asset_id]
    );

    await client.query("COMMIT");

    res.json({ message: "Maintenance request rejected" });
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
};


exports.getMyMaintenanceRequests = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    const result = await db.query(
      `
      SELECT
        m.maintenance_id AS id,
        'REPAIR' AS type,
        a.asset_name,
        m.status,
        m.issue_description AS description,
        m.created_at
      FROM maintenance_requests m
      JOIN assets a ON a.asset_id = m.asset_id
      WHERE m.reported_by = $1
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};


