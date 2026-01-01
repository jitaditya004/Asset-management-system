// external modules
const express = require("express");
const router = express.Router();
const multer = require("multer");
// internal modules
const assetController = require("../controllers/assetController");
const { authenticate } = require("../middlewares/auth");
const { authorize } = require("../middlewares/rbac");
const upload = require("../config/upload");

const MAX_SIZE = 10 * 1024 * 1024; // 10MB


const {PERMISSIONS} = require("../config/permission"); 

// const allowedDocs = [
//   "application/pdf",
//   "application/msword",
//   "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//   "application/vnd.ms-excel",
//   "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
// ];

// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: MAX_SIZE },
//   fileFilter: (req, file, cb) => {
//     if (file.fieldname === "images") {
//       if (!file.mimetype.startsWith("image/")) {
//         return cb(new Error("Only image files are allowed"), false);
//       }
//       return cb(null, true);
//     }

//     if (file.fieldname === "documents") {
//       if (!allowedDocs.includes(file.mimetype)) {
//         return cb(new Error("Invalid document type"), false);
//       }
//       return cb(null, true);
//     }

//     cb(new Error("Unexpected file field"), false);
//   }
// });


// create asset (admin or asset_manager)
// router.post(
//   "/",
//   authenticate,
//   authorize("admin", "asset_manager"),
//   upload.fields([
//     { name: "images", maxCount: 5 },
//     { name: "documents", maxCount: 5 },
//   ]),
//   assetController.create
// );






// list all assets (accessible by authenticated users)
router.get("/", authenticate, assetController.list);
// get one asset (admin and asset_manager depart. restrictions checked in controller)
router.get("/:id", authenticate, assetController.getOne);
// update asset (admin and asset_manager, depart. restrictions checked in controller)
router.patch(
  "/:id",
  authenticate,
  authorize("admin", "asset_manager"),
  assetController.update
);
// delete asset (admin and asset_manager, depart. restrictions checked in controller)
router.delete(
  "/:id",
  authenticate,
  authorize("admin", "asset_manager"),
  assetController.remove
);





// // delete asset file (admin and asset_manager, department restrictions handled in controller)
// router.delete(
//   "/files/:fileId",
//   authenticate,
//   authorize("admin", "asset_manager"),
//   assetController.deleteAssetFile
// );

// // download asset file (all authenticated users, role-based restrictions handled in controller)
// router.get(
//   "/files/:fileId/download",
//   authenticate,
//   assetController.downloadAssetFile
// );


router.post("/:id/attachments",authenticate,upload.single("file"),assetController.uploadDocs);//asset public id
router.get("/:id/attachments",authenticate,assetController.listDocs);//asset public id
router.get("/:id/attachments/url",authenticate,assetController.getDocUrl);//doc id
router.delete("/:id/attachments/",authenticate,assetController.deleteDoc);//doc id
router.get("/:fileId/attachments/download",authenticate,assetController.downloadAssetDocs);






module.exports = router;
