const db = require("../config/db");

exports.getStatusHistory = async (publicId) => {
    try{
        const { rows } = await db.query(
        `SELECT h.new_status, h.reason, h.changed_at, u.full_name
            FROM asset_status_history h
            LEFT JOIN users u ON u.user_id = h.changed_by
            WHERE h.asset_public_id = $1
            ORDER BY h.changed_at ASC`,
        [publicId]
        );

        return rows;
    }catch(err){
        next(err);
    }
};


exports.updateAssetStatus = async ({
  publicId,
  newStatus,
  userId,
  reason = null,
}) => {
  const client = await db.pool.connect();
  client.on("error", (err) => {
    console.error("PG client error (auto-handled):", err);
  });


  try {
    await client.query("BEGIN");

  
    const { rows } = await client.query(
      "SELECT asset_id,status FROM assets WHERE public_id = $1 FOR UPDATE",
      [publicId]
    );

    if (rows.length === 0) {
      throw new Error("Asset not found");
    }

    const currentStatus = rows[0].status;
    const assetId = rows[0].asset_id;

    // if (!ALLOWED_TRANSITIONS[currentStatus].includes(newStatus)) {
    //   throw new Error(
    //     `Invalid transition from ${currentStatus} → ${newStatus}`
    //   );
    // }

    
    await client.query(
      "UPDATE assets SET status = $1 WHERE public_id = $2",
      [newStatus, publicId]
    );
///addv asset id fetch  anfd put in column
  
    await client.query(
      `INSERT INTO asset_status_history
       (asset_id,asset_public_id, old_status, new_status, reason, changed_by)
       VALUES ($1, $2, $3, $4, $5,$6)`,
      [assetId,publicId, currentStatus, newStatus, reason, userId]
    );

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};