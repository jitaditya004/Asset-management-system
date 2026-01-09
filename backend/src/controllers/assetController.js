// internal modules
const assetModel = require("../models/assetModel");
const canUploadAsset=require("../helper/canUpload");
const supabase=require("../config/supabaseClient");


/**
 * Upload single file (image or document)
 */
async function uploadAssetFile({ file, asset_id, public_id }) {
  const bucket = "asset-attachments";
  const filePath = `${public_id}/${Date.now()}-${file.originalname}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
    });

  if (error) {
    throw new Error("File upload failed");
  }

  await assetModel.saveAssetFileMeta({
    asset_id,
    public_id,
    bucket,
    file_path: filePath,
    file_type: file.mimetype.startsWith("image/")
      ? "image"
      : "document",
    mime_type: file.mimetype,
    original_name: file.originalname,
  });
}

/**
 * CREATE ASSET
 */
exports.create = async (req, res, next) => {
  console.log(req.body);
  try {
    const {
      asset_name,
      category,
      subcategory,
      serial_number,
      model_number,
      purchase_date,
      purchase_cost,
      vendor,
      warranty_expiry,
      status,
      department,

      // optional
      assigned_to = "NOT ASSIGNED",
      description,
      location,
      latitude,
      longitude,
      region
    } = req.body;

    

    /* -------------------- VALIDATION -------------------- */
    const requiredFields = [
      asset_name,
      category,
      subcategory,
      serial_number,
      model_number,
      purchase_date,
      purchase_cost,
      vendor,
      warranty_expiry,
      status,
      department,
    ];

    if (requiredFields.some(v => v === undefined || v === null || v === "")) {
      return res.status(400).json({
        error: "Missing required asset fields",
      });
    }

    /* -------------------- ASSIGNED USER CHECK -------------------- */
    if (assigned_to !== "NOT ASSIGNED") {
      const user = await userModel.getUserByPublicId(assigned_to);
      if (!user) {
        return res.status(400).json({
          error: "Assigned user does not exist",
        });
      }
    }

    /* -------------------- PAYLOAD -------------------- */
    const payload = {
      asset_name,
      category,
      subcategory,
      serial_number,
      model_number,
      purchase_date,
      purchase_cost,
      vendor,
      warranty_expiry,
      status,
      department,

      assigned_to,
      description: description || "NO DESCRIPTION",
      location,
      region,
      latitude: latitude || null,
      longitude: longitude || null,
    };

    /* -------------------- CREATE ASSET -------------------- */
    const asset = await assetModel.createAsset(payload);
    const { asset_id, public_id } = asset;

    /* -------------------- FILE UPLOADS -------------------- */
    if (req.files) {
      const allFiles = [
        ...(req.files.images || []),
        ...(req.files.documents || []),
      ];

      for (const file of allFiles) {
        await uploadAssetFile({
          file,
          asset_id,
          public_id,
        });
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
    // const userRole = req.user.role.toUpperCase();
    // if (
    //   (userRole === "ASSET_MANAGER" || userRole === "USER") &&
    //   req.user.department_id && req.query.assigned_to != null
    // ) {
    //   filters.department_id = req.user.department_id;
    // }

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
    // if (userRole === "ASSET_MANAGER" || userRole === "USER") {
    //   const assetDepartmentId = asset.asset_department_id;
    //   // Allow access if asset is unassigned (null department) OR belongs to user's department
    //   // Block if asset belongs to a different department
    //   if (
    //     assetDepartmentId !== null &&
    //     assetDepartmentId !== req.user.department_id
    //   ) {
    //     return res.status(403).json({
    //       error: "Access denied: Asset belongs to a different department",
    //     });
    //   }
    // }

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
const db=require("../config/db");  
const safeSupabase = require("../utils/safeSupabase");
const withTransaction=require("../config/withTransaction");

exports.uploadDocs=async(req,res)=>{  //make it model later
  try {
      await withTransaction(async(client)=>{
      const public_Id = req.params.id;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

  
      const assetRes = await client.query(
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


      if (!canUploadAsset(req.user, assetDeptId)) {
        return res.status(403).json({ message: "Forbidden" });
      }

  
      const storagePath = `assets/${public_Id}/${Date.now()}-${file.originalname}`;

      // if (!supabase) {
      //   return res.status(503).json({
      //     message: "File storage service unavailable",
      //   });
      // }

      // const { error } = await supabase.storage
      //   .from("asset-attachments")
      //   .upload(storagePath, file.buffer, {
      //     contentType: file.mimetype
      //   });

      // if (error) {
      //   console.error(error);
      //   return res.status(500).json({ message: "Upload failed" });
      // }

      const { data, error } = await safeSupabase(sb =>
        sb.storage.from("asset-attachments").upload(storagePath, file.buffer, {
          contentType: file.mimetype,
        })
      );

      if (error) {
        return res.status(503).json({
          message: "Storage service unavailable",
        });
      }

      await client.query(
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

      
      await client.query(
        `INSERT INTO audit_log
         (actor_id, action, target_type, target_id,payload)
         VALUES ($1, $2, $3, $4,$5)`,
        [
          req.user.user_id,
          "UPLOAD_ASSET_DOCUMENT",
          "ASSET",
          assetId,
          req.user
        ]
      );});

      res.json({ message: "File uploaded successfully" });
    }catch(err){
      console.error(err);
      //503-service unavailable
       return res.status(503).json({
          message: "Failed to upload file",
          details: "Storage service unavailable",
        });
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

      
    if (error) {
      return res.status(503).json({
        message: "Storage service unavailable",
      });
    }

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
