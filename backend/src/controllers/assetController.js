// internal modules
const assetModel = require("../models/assetModel");
const { supabase } = require("../config/supabaseClient");

async function uploadFile(file, asset_id, public_id) {
  const bucket = file.mimetype.startsWith("image/")
    ? "asset-images"
    : "asset-documents";

  const filePath = `${public_id}/${file.originalname}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
    });

  if (error) throw error;

  await assetModel.saveAssetFileMeta({
    asset_id,
    public_id,
    bucket,
    file_path: filePath,
    file_type: file.mimetype.startsWith("image/") ? "image" : "document",
    mime_type: file.mimetype,
    original_name: file.originalname,
  });
}

exports.create = async (req, res, next) => {
  console.log("REQ BODY:", req.body);
  console.log("REQ FILES:", Object.keys(req.files || {}));

  try {
    // Destructure assigned_to and description as optional (default to null if not provided)
    const {
      asset_name,
      category,
      subcategory,
      serial_number,
      model_number,
      purchase_date,
      purchase_cost,
      vendor,
      status,
      location,
      assigned_to = "NOT ASSIGNED",
      warranty_expiry,
      description = "NO DESCRIPTION",
      department
    } = req.body;

    // Only check required fields
    if (
      !asset_name ||
      !category ||
      !subcategory ||
      !serial_number ||
      !model_number ||
      !purchase_date ||
      !purchase_cost ||
      !vendor ||
      !status ||
      !location ||
      !assigned_to ||
      !warranty_expiry ||
      !department
    ) {
      return res.status(400).json({ error: "Missing required asset details" });
    }

    // Check if assigned_to user exists (by public_id)
    if (assigned_to != "NOT ASSIGNED") {
      const userModel = require("../models/userModel");
      const assignedUser = await userModel.getUserByPublicId(assigned_to);
      if (!assignedUser) {
        return res
          .status(400)
          .json({ error: "assigned_to user does not exist" });
      }
    }

    // Prepare payload, passing assigned_to and description (possibly as null)
    const latitude = location?.latitude;
    const longitude = location?.longitude;

    const payload = {
      asset_name,
      category,
      subcategory,
      serial_number,
      model_number,
      purchase_date,
      purchase_cost,
      vendor,
      status,
      latitude,
      longitude,
      assigned_to,
      warranty_expiry,
      description,
      department
    };

    const asset = await assetModel.createAsset(payload);
    const { asset_id, public_id } = asset;

    // Handle images
    if (req.files?.images?.length) {
      for (const file of req.files.images) {
        await uploadFile(file, asset_id, public_id);
      }
    }

    // Handle documents
    if (req.files?.documents?.length) {
      for (const file of req.files.documents) {
        await uploadFile(file, asset_id, public_id);
      }
    }

    res.status(201).json(asset);
  } catch (err) {
    next(err);
  }
};

exports.list = async (req, res, next) => {
  try {
    const filters = {
      category: req.query.category,
      subcategory: req.query.subcategory,
      assigned_to: req.query.assigned_to,
      purchase_date_from: req.query.purchase_date_from,
      purchase_date_to: req.query.purchase_date_to,
      vendor: req.query.vendor,
      status: req.query.status,
      model_number: req.query.model_number,
      search: req.query.search,
      sort_by: req.query.sort_by,
      sort_direction: req.query.sort_direction,
      warranty_expiry_status: req.query.warranty_expiry_status,
      warranty_expiry_from: req.query.warranty_expiry_from,
      warranty_expiry_to: req.query.warranty_expiry_to,
    };

    // ASSET_MANAGER and USER can see assets from their department AND unassigned assets
    // ADMIN sees all assets (no department filter)
    const userRole = req.user.role.toUpperCase();
    if (
      (userRole === "ASSET_MANAGER" || userRole === "USER") &&
      req.user.department_id && req.query.assigned_to != "NOT ASSIGNED"
    ) {
      filters.department_id = req.user.department_id;
    }

    const assets = await assetModel.listAssets(filters);
    res.json(assets);
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const asset = await assetModel.getAssetById(req.params.id);
    if (!asset) return res.status(404).json({ error: "Asset not found" });

    // ASSET_MANAGER and USER can access assets from their department AND unassigned assets
    const userRole = req.user.role.toUpperCase();
    if (userRole === "ASSET_MANAGER" || userRole === "USER") {
      const assetDepartmentId = asset.asset_department_id;
      // Allow access if asset is unassigned (null department) OR belongs to user's department
      // Block if asset belongs to a different department
      if (
        assetDepartmentId !== null &&
        assetDepartmentId !== req.user.department_id
      ) {
        return res.status(403).json({
          error: "Access denied: Asset belongs to a different department",
        });
      }
    }

    res.json(asset);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    // ASSET_MANAGER can only update assets from their department (not unassigned assets)
    if (req.user.role.toUpperCase() === "ASSET_MANAGER") {
      const assetDepartmentId = await assetModel.getAssetDepartmentId(
        req.params.id
      );
      // Block if asset is unassigned (null) OR belongs to different department
      if (!assetDepartmentId || assetDepartmentId !== req.user.department_id) {
        return res.status(403).json({
          error:
            "Access denied: Cannot update unassigned assets or assets from other departments",
        });
      }
    }

    const updated = await assetModel.updateAsset(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const asset_id = req.params.id;

    // ASSET_MANAGER can only delete assets from their department (not unassigned assets)
    if (req.user.role.toUpperCase() === "ASSET_MANAGER") {
      const assetDepartmentId = await assetModel.getAssetDepartmentId(asset_id);
      // Block if asset is unassigned (null) OR belongs to different department
      if (!assetDepartmentId || assetDepartmentId !== req.user.department_id) {
        return res.status(403).json({
          error:
            "Access denied: Cannot delete unassigned assets or assets from other departments",
        });
      }
    }

    const files = await assetModel.getFilesByAssetId(asset_id);

    for (const file of files) {
      const { error } = await supabase.storage
        .from(file.bucket)
        .remove([file.file_path]);

      if (error) {
        throw new Error(`Failed to delete file: ${file.file_path}`);
      }
    }
    await assetModel.deleteAsset(asset_id);
    res.json({ success: true, message: "Asset deleted successfully" });
  } catch (err) {
    next(err);
  }
};

exports.deleteAssetFile = async (req, res, next) => {
  try {
    const { fileId } = req.params;

    const file = await assetModel.getFilesByFileId(fileId);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    const { error } = await supabase.storage
      .from(file.bucket)
      .remove([file.file_path]);

    if (error) throw error;

    await assetModel.deleteAssetFileMeta(fileId);

    res.json({ message: "File deleted successfully" });
  } catch (err) {
    next(err);
  }
};

exports.downloadAssetFile = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const userRole = req.user.role.toUpperCase();

    // Get file metadata by fileId
    const file = await assetModel.getFilesByFileId(fileId);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    // Role-based access control for file downloads
    // ADMIN: Can download any file
    // ASSET_MANAGER / USER: Can download files from assets in their department OR unassigned assets
    if (userRole !== "ADMIN") {
      const assetDepartmentId = await assetModel.getAssetDepartmentId(file.asset_id);
      if (assetDepartmentId !== null && assetDepartmentId !== req.user.department_id) {
        return res.status(403).json({
          error: "Access denied: Cannot download files from assets outside your department",
        });
      }
    }

    // Retrieve the file from Supabase storage
    const { data, error } = await supabase.storage
      .from(file.bucket)
      .download(file.file_path);

    if (error || !data) {
      return res.status(500).json({ error: "Failed to download file." });
    }

    // Set headers for download
    res.setHeader("Content-Disposition", `attachment; filename="${file.original_name}"`);
    res.setHeader("Content-Type", file.mime_type);

    // Pipe the readable stream or buffer to the response
    if (typeof data.pipe === 'function') {
      data.pipe(res);
    } else {
      // If Supabase returns a Blob or Buffer
      res.end(Buffer.from(await data.arrayBuffer()));
    }
  } catch (err) {
    next(err);
  }
};
