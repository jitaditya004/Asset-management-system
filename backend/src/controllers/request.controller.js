const requestModel = require("../models/request.model");

/* User creates request */
exports.requestAsset = async (req, res, next) => {
  try {
    const { assetId } = req.params;
    const { reason } = req.body;

    const exists = await requestModel.hasPendingRequest(
      assetId,
      req.user.user_id
    );
    if (exists) {
      return res.status(400).json({ message: "Already requested" });
    }

    const request = await requestModel.createRequest({
      asset_id: assetId,
      requested_by: req.user.user_id,
      requested_department_id: req.user.department_id,
      reason
    });

    res.json(request);
  } catch (err) {
    next(err);
  }
};

/* User requests */
exports.myRequests = async (req, res, next) => {
  try {
    const data = await requestModel.getMyRequests(req.user.user_id);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

/* Admin requests */
exports.allRequests = async (req, res, next) => {
  try {
    const data = await requestModel.getAllRequests();
    res.json(data);
  } catch (err) {
    next(err);
  }
};

/* Admin review */
exports.review = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const { action, comment } = req.body;

    await requestModel.reviewRequest({
      request_id: requestId,
      action,
      admin_id: req.user.user_id,
      comment
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};




const db = require("../config/db");

exports.deleteRequest = async (req, res) => {
  const { id } = req.params;

  const result = await db.query(
    "DELETE FROM asset_requests WHERE request_id = $1 RETURNING request_id",
    [id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ message: "Request not found" });
  }

  res.json({ message: "Request deleted" });
};







exports.getMyAllRequests = async (req, res, next) => {
  try {
    const userId = req.user.user_id;

    const result = await db.query(
      `
      SELECT *
      FROM (
        -- Asset requests
        SELECT
          r.request_id AS id,
          'ASSET' AS type,
          a.asset_name,
          r.status,
          r.admin_comment AS description,
          r.created_at
        FROM asset_requests r
        JOIN assets a ON a.asset_id = r.asset_id
        WHERE r.requested_by = $1

        UNION ALL

        -- Maintenance requests
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
      ) x
      ORDER BY created_at DESC
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};
