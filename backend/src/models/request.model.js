const db = require("../config/db");

/* Create request */
exports.createRequest = async ({
  asset_id,
  requested_by,
  requested_department_id,
  reason
}) => {
  const res = await db.query(
    `INSERT INTO asset_requests
     (asset_id, requested_by, requested_department_id, reason)
     VALUES ($1,$2,$3,$4)
     RETURNING *`,
    [asset_id, requested_by, requested_department_id, reason]
  );
  return res.rows[0];
};

/* Check existing pending request */
exports.hasPendingRequest = async (asset_id, user_id) => {
  const res = await db.query(
    `SELECT 1 FROM asset_requests
     WHERE asset_id=$1 AND requested_by=$2 AND status='PENDING'`,
    [asset_id, user_id]
  );
  return res.rowCount > 0;
};

/* User requests */
exports.getMyRequests = async (user_id) => {
  const res = await db.query(
    `SELECT r.*, a.asset_name
     FROM asset_requests r
     JOIN assets a ON a.asset_id=r.asset_id
     WHERE r.requested_by=$1
     ORDER BY r.created_at DESC`,
    [user_id]
  );
  return res.rows;
};

/* Admin requests */
exports.getAllRequests = async () => {
  const res = await db.query(
    `SELECT r.*, 
            a.asset_name,
            u.full_name AS requested_by_name
     FROM asset_requests r
     JOIN assets a ON a.asset_id=r.asset_id
     JOIN users u ON u.user_id=r.requested_by
     ORDER BY r.created_at DESC`
  );
  return res.rows;
};

/* Review request */
exports.reviewRequest = async ({
  request_id,
  action,
  admin_id,
  comment
}) => {
  const client = await db.pool.connect();
  try {
    await client.query("BEGIN");

    const reqRes = await client.query(
      `SELECT * FROM asset_requests WHERE request_id=$1`,
      [request_id]
    );
    if (!reqRes.rows.length) throw new Error("Request not found");

    const req = reqRes.rows[0];

    if (action === "APPROVE") {
      await client.query(
        `UPDATE asset_requests
         SET status='APPROVED',
             reviewed_by=$1,
             reviewed_at=NOW(),
             admin_comment=$3
         WHERE request_id=$2`,
        [admin_id, request_id,comment]
      );

      await client.query(
        `UPDATE assets
         SET assigned_to=$1,
             department_id=$2,
             status='ACTIVE'
         WHERE asset_id=$3`,
        [req.requested_by, req.requested_department_id, req.asset_id]
      );
    } else {
      await client.query(
        `UPDATE asset_requests
         SET status='REJECTED',
             admin_comment=$1,
             reviewed_by=$2,
             reviewed_at=NOW()
         WHERE request_id=$3`,
        [comment, admin_id, request_id]
      );
    }

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
};
