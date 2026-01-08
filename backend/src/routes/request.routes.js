const router = require("express").Router();
const ctrl = require("../controllers/request.controller");
const { authenticate } = require("../middlewares/auth");
const { authorize } = require("../middlewares/rbac");

/* User */
router.post("/:assetId", authenticate, ctrl.requestAsset);
router.get("/my", authenticate, ctrl.myRequests);

/* Admin */
router.get("/admin/all", authenticate, authorize("ADMIN"), ctrl.allRequests);
router.post(
  "/admin/:requestId/decision",
  authenticate,
  authorize("ADMIN"),
  ctrl.review
);
router.delete(
  "/requests/:id",
  authenticate,
  authorize("ADMIN"),
  ctrl.deleteRequest
);
router.get("/my/all",authenticate,ctrl.getMyAllRequests);

module.exports = router;


