const db = require("../../config/db");

exports.createLocation = async (req, res, next) => {
  const {
    location_name,
    region,
    address,
    description,
    latitude,
    longitude
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO locations
       (location_name, region, address, description, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        location_name,
        region,
        address || null,
        description || null,
        latitude || null,
        longitude || null
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};


exports.getLocations = async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT
         l.location_id,
         l.location_name,
         l.region,
         
         l.lat,
         l.long,
         COUNT(a.asset_id) AS asset_count
       FROM locations l
       LEFT JOIN assets a
         ON a.location_id = l.location_id
       GROUP BY
         l.location_id,
         l.location_name,
         l.region,
         
         l.lat,
         l.long
       ORDER BY l.location_name`
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    next(err);
  }
};


exports.getLocationById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `SELECT * FROM locations WHERE location_id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Location not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};


exports.updateLocation = async (req, res, next) => {
  const { id } = req.params;
  const {
    location_name,
    region,
    address,
    description,
    latitude,
    longitude
  } = req.body;

  try {
    const result = await db.query(
      `UPDATE locations
       SET location_name = COALESCE($2, location_name),
           region = COALESCE($3, region),
           address = COALESCE($4, address),
           description = COALESCE($5, description),
           latitude = COALESCE($6, latitude),
           longitude = COALESCE($7, longitude)
       WHERE location_id = $1
       RETURNING *`,
      [
        id,
        location_name,
        region,
        address,
        description,
        latitude,
        longitude
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Location not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};


exports.deleteLocation = async (req, res, next) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `DELETE FROM locations
       WHERE location_id = $1
       RETURNING location_id`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Location not found" });
    }

    res.json({ message: "Location deleted" });
  } catch (err) {
    next(err);
  }
};


