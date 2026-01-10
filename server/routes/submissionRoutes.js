const express = require("express");
const router = express.Router();
const {
  createSubmission,
  getAllSubmissions,
  updateSubmission,
  deleteSubmission,
  getDeletedSubmissions,
  restoreSubmission,
} = require("../controller/submissionController");
const { protect } = require("../middleware/authMiddleware");
const { upload, } = require("../middleware/upload-Middleware");
const timeRestriction = require("../middleware/timeRestriction-Middleware");
const { scanAndUpload } = require("../middleware/scanMiddleWare");
// Public route for creating submissions with time restriction and file upload
router.post(
  "/",
  timeRestriction,
  // upload.single("file"),
  upload.array("files", 5),
  // fileCheck,
  scanAndUpload,
  createSubmission
);

// Admin-only routes for managing submissions
router.get("/", protect, getAllSubmissions);
router.get("/bin", protect, getDeletedSubmissions);
router.delete("/:id", protect, deleteSubmission);
router.patch("/:id/restore", protect, restoreSubmission);
router.put("/:id", protect, updateSubmission);
module.exports = router;
