// routes/doctorRoutes.js
const express = require("express");
const { 
    saveDoctorProfile, 
    fetchDoctorProfile,
    getDoctorStats,
    getUpcomingAppointments,
    getPatientRecords,
    getMyPatients,
    getSharedRecordsForPatient,
    getDoctorAppointments,
    updateAppointmentStatus // **NEW**: Import
} = require("../controllers/doctorController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/multerMiddleware");

const router = express.Router();

// Profile Routes
router.post("/profile", protect, upload.single("photo"), saveDoctorProfile);
router.get("/profile", protect, fetchDoctorProfile);

// Dashboard Routes
router.get("/dashboard/stats", protect, getDoctorStats);
router.get("/dashboard/appointments", protect, getUpcomingAppointments);
router.get("/dashboard/records", protect, getPatientRecords);

// "Your Patients" Page Routes
router.get("/my-patients", protect, getMyPatients);
router.get("/my-patients/:patientId/records", protect, getSharedRecordsForPatient);

// "Appointments" Page Routes
router.get("/appointments", protect, getDoctorAppointments);
router.put("/appointments/:id/status", protect, updateAppointmentStatus); // **NEW**: Route to approve/deny

module.exports = router;

