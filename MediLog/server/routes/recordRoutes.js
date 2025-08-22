// server/routes/recordRoutes.js
const express = require("express");
const {
    getRecords,
    createRecord,
    deleteRecord,
    getSharedRecord,
    streamRecordFile,
    downloadRecordFile,
    getSharedRecordFile,
    createRecordLocal,
    streamLocalRecord
} = require("../controllers/recordController");
const { protect } = require("../middleware/authMiddleware");
const uploadCloudinary = require("../middleware/uploadCloudinary");
const uploadLocal = require("../middleware/multer");

const router = express.Router();

// All records for logged-in user
router.get("/", protect, getRecords);

// Upload record
// router.post("/", protect, uploadCloudinary.single("file"), createRecord);
router.post("/", protect, uploadLocal.single("file"), createRecordLocal);

// Delete record
router.delete("/:id", protect, deleteRecord);

// Public metadata by share token
router.get("/shared/:token", getSharedRecord);

// Public file via share token
router.get("/shared/:token/file", getSharedRecordFile);

// View a file (authenticated) – will also allow token in query param
// router.get("/:id/view", protect, streamRecordFile);
router.get("/:id/view", protect, streamLocalRecord);

// Download a file (authenticated) – will also allow token in query param
router.get("/:id/download", protect, downloadRecordFile);

module.exports = router;
