const express = require("express");
const {
  registerUser,
  authUser,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
  getAllDoctors, // Import new function
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", authUser);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

// Password Reset Routes
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// **NEW**: Route to get all doctors (for sharing)
router.get("/doctors", protect, getAllDoctors);

module.exports = router;

