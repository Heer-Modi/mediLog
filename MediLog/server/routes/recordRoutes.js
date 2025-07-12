const express = require("express");
const {
    getRecords,
    createRecord,
    deleteRecord,
    getSharedRecord
} = require("../controllers/recordController");
const { protect } = require("../middleware/authMiddleware");
const uploadCloudinary = require("../middleware/uploadCloudinary");

const router = express.Router();

router.route("/")
    .get(protect, getRecords)
    .post(protect, uploadCloudinary.single("file"), createRecord);

router.route("/:id")
    .delete(protect, deleteRecord);

router.route("/shared/:token")
    .get(getSharedRecord);

module.exports = router;
