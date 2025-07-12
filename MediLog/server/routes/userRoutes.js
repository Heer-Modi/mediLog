const express = require("express");
const { registerUser, authUser, getProfile, updateProfile } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", authUser);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);


module.exports = router;
