const express = require("express");
const router = express.Router();
const {
  registerAdmin,
  loginAdmin,
  getAuditLogs,
} = require("../controller/adminController");
const { protect } = require("../middleware/authMiddleware");

// -------------------- LOGIN RATE LIMITER --------------------
const rateLimit = require("express-rate-limit");
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                   // maximum 5 attempts per IP
  message: "Too many login attempts. Please try again after 15 minutes.",
});


router.post("/register", registerAdmin); 
router.post("/login", loginLimiter, loginAdmin);
router.get("/audit-logs", protect, getAuditLogs);

module.exports = router;
