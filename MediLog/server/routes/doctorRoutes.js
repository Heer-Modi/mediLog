// routes/doctorRoutes.js
const express = require("express");
const { saveDoctorProfile, fetchDoctorProfile } = require("../controllers/doctorController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/multerMiddleware");

const router = express.Router();

router.post("/profile", protect, upload.single("photo"), saveDoctorProfile);
router.get("/profile", protect, fetchDoctorProfile);

module.exports = router;
