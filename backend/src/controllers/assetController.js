// internal modules
const assetModel = require("../models/assetModel");



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




















//req.user to res.locals.user later
const db=require("../config/db");  //remove it later
const canUploadAsset=require("../helper/canUpload");
const supabase=require("../config/supabaseClient");
exports.uploadDocs=async(req,res)=>{  //make it model later
  try {
      const public_Id = req.params.id;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // 1️⃣ Fetch asset department
      const assetRes = await db.query(
        `SELECT department_id,asset_id
         FROM assets
         WHERE public_id = $1`,
        [public_Id]
      );

      if (assetRes.rowCount === 0) {
        return res.status(404).json({ message: "Asset not found" });
      }

      const assetId=assetRes.rows[0].asset_id; 

      const assetDeptId = assetRes.rows[0].department_id;

      // 2️⃣ Authorization check
      if (!canUploadAsset(req.user, assetDeptId)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // 3️⃣ Upload to Supabase Storage
      const storagePath = `assets/${public_Id}/${Date.now()}-${file.originalname}`;

      const { error } = await supabase.storage
        .from("asset-attachments")
        .upload(storagePath, file.buffer, {
          contentType: file.mimetype
        });

      if (error) {
        console.error(error);
        return res.status(500).json({ message: "Upload failed" });
      }

      // 4️⃣ Save metadata in DB
      await db.query(
        `INSERT INTO asset_documents
         (asset_id, document_type, file_path,original_name, uploaded_by)
         VALUES ($1, $2, $3, $4,$5)`,
        [
          assetId,
          file.mimetype,
          storagePath,
          file.originalname,
          req.user.user_id
        ]
      );

      // 5️⃣ Audit log (VERY GOOD FOR INTERVIEWS)
      await db.query(
        `INSERT INTO audit_log
         (actor_id, action, target_type, target_id)
         VALUES ($1, $2, $3, $4)`,
        [
          req.user.user_id,
          "UPLOAD_ASSET_DOCUMENT",
          "ASSET",
          assetId
        ]
      );

      res.json({ message: "File uploaded successfully" });
    }catch(err){
      console.error(err);
      res.status(500).json({message:"server error"});
    }
}


//retrieve attachments details
//attachments not loading
exports.listDocs = async (req, res) => {
  try{
  const publicId = req.params.id;

  
  const asset = await assetModel.getAssetById(publicId);

  if (!asset) {
    return res.status(404).json({ message: "Asset not found" });
  }

  const assetId = asset.asset_id;

  const result = await db.query(
    `SELECT *
     FROM asset_documents
     WHERE asset_id = $1
     ORDER BY uploaded_at DESC`,
    [assetId]
  );

  res.json(result.rows);


  }catch(err){
    console.log(err);  
  }
};


exports.getDocUrl = async (req, res) => {
  const docId = req.params.id;

  const result = await db.query(
    `SELECT file_path FROM asset_documents WHERE document_id = $1`,
    [docId]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ message: "Not found" });
  }

  const { data, error } = await supabase.storage
    .from("asset-attachments")
    .createSignedUrl(result.rows[0].file_path, 300);

  if (error) throw error;

  res.json({ url: data.signedUrl });  
};


exports.deleteDoc = async (req, res) => {
  try {
    const docId = req.params.id;

    // 1️⃣ Get attachment metadata
    const result = await db.query(
      `SELECT file_path, uploaded_by
       FROM asset_documents
       WHERE document_id = $1`,
      [docId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Attachment not found" });
    }

    const { file_path, uploaded_by } = result.rows[0];

    // 2️⃣ Permission check
    if (
      req.user.role !== "ADMIN" &&
      req.user.user_id !== uploaded_by
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // 3️⃣ Delete from Supabase
    const { error } = await supabase.storage
      .from("asset-attachments")
      .remove([file_path]);

    if (error) {
      console.error(error);
      return res.status(500).json({ message: "Storage delete failed" });
    }

    // 4️⃣ Delete DB record
    await db.query(
      `DELETE FROM asset_documents WHERE document_id = $1`,
      [docId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("deleteDoc error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// controllers/assetController.js

exports.downloadAssetDocs = async (req, res) => {
  try {
    const { fileId } = req.params;

    // 1️⃣ Get file metadata from DB
    const result = await db.query(
      `SELECT file_path, original_name, document_type
       FROM asset_documents
       WHERE document_id = $1`,
      [fileId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "File not found" });
    }

    const { file_path, original_name, document_type } = result.rows[0];

    const { data, error } = await supabase.storage
      .from("asset-attachments")
      .download(file_path);

    if (error || !data) {
      console.error(error);
      return res.status(500).json({ message: "Failed to download file" });
    }

    
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${original_name}"`
    );
    res.setHeader("Content-Type", document_type);

    // 4️⃣ Send file bytes
    if (typeof data.pipe === "function") {
      // stream (best case)
      data.pipe(res);
    } else {
      // blob / buffer fallback
      const buffer = Buffer.from(await data.arrayBuffer());
      res.send(buffer);
    }

  } catch (err) {
    console.error("downloadAssetFile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
