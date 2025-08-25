const express = require("express");
const { savePatientProfile, fetchPatientProfile } = require("../controllers/patientController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/multerMiddleware");

const router = express.Router();

router.post("/profile", protect, upload.single("photo"), savePatientProfile);
router.get("/profile", protect, fetchPatientProfile);

module.exports = router;
