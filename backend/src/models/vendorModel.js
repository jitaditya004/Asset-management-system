const db = require("../config/db");


exports.createVendor = async (data) => {
  const { vendor_name, contact_person, phone, email, address } = data;

  const result = await db.query(
    `INSERT INTO vendors
     (vendor_name, contact_person, phone, email, address)
     VALUES ($1,$2,$3,$4,$5)
     RETURNING *`,
    [vendor_name, contact_person, phone, email, address]
  );

  return result.rows[0];
};


exports.listVendors = async () => {
  const { rows } = await db.query(
    `SELECT vendor_id, vendor_name, contact_person, phone, email, address
     FROM vendors
     ORDER BY vendor_name`
  );
  return rows;
};

exports.updateVendor = async (vendor_id, data) => {
  const fields = [];
  const values = [];
  let idx = 1;

  for (const [key, value] of Object.entries(data)) {
    fields.push(`${key} = $${idx++}`);
    values.push(value);
  }

  if (!fields.length) {
    throw new Error("No fields to update");
  }

  values.push(vendor_id);

  const result = await db.query(
    `UPDATE vendors
     SET ${fields.join(", ")}
     WHERE vendor_id = $${idx}
     RETURNING *`,
    values
  );

  return result.rows[0];
};


exports.deleteVendor = async (vendor_id) => {
  const assetCheck = await db.query(
    "SELECT COUNT(*) FROM assets WHERE vendor_id = $1",
    [vendor_id]
  );

  if (parseInt(assetCheck.rows[0].count, 10) > 0) {
    return { message: "Cannot delete vendor: assets exist" };
  }

  const res = await db.query(
    "DELETE FROM vendors WHERE vendor_id = $1 RETURNING *",
    [vendor_id]
  );

  return res.rows[0] || null;
};
