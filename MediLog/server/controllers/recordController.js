// server/controllers/recordController.js

const Record = require("../models/Record");
const crypto = require("crypto");
const cloudinary = require("../config/cloudinary");

/**
 * @desc Get all records for the logged-in user
 * @route GET /api/records
 * @access Private
 */
exports.getRecords = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized, please log in" });
        }
        const records = await Record.find({ user: req.user.id });
        res.json(records);
    } catch (error) {
        console.error("GetRecords Error:", error);
        res.status(500).json({ message: "Server error fetching records" });
    }
};

/**
 * @desc Create a new record & upload to Cloudinary
 * @route POST /api/records
 * @access Private
 */
exports.createRecord = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized, please log in" });
        }

        const { title, description, category, date } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        if (!category || !title || !date) {
            return res.status(400).json({ message: "Category, title, and date are required" });
        }

        const shareToken = crypto.randomBytes(16).toString("hex");

        const record = await Record.create({
            user: req.user.id,
            title,
            description,
            category,
            date,
            fileUrl: req.file.path, // multer-storage-cloudinary should give the public URL here
            cloudinaryId: req.file.filename,
            shareToken,
        });

        res.status(201).json(record);
    } catch (error) {
        console.error("CreateRecord Error:", error);
        res.status(500).json({ message: "Server error uploading record" });
    }
};

/**
 * @desc Delete a record (and from Cloudinary)
 * @route DELETE /api/records/:id
 * @access Private
 */
exports.deleteRecord = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized, please log in" });
        }

        const record = await Record.findById(req.params.id);
        if (!record) {
            return res.status(404).json({ message: "Record not found" });
        }

        if (record.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to delete this record" });
        }

        if (record.cloudinaryId) {
            await cloudinary.uploader.destroy(record.cloudinaryId);
        }

        await record.deleteOne();
        res.json({ message: "Record removed successfully" });
    } catch (error) {
        console.error("DeleteRecord Error:", error);
        res.status(500).json({ message: "Server error deleting record" });
    }
};

/**
 * @desc Get record info by share token (public metadata)
 * @route GET /api/records/shared/:token
 * @access Public
 */
exports.getSharedRecord = async (req, res) => {
    try {
        const record = await Record.findOne({ shareToken: req.params.token });
        if (!record) {
            return res.status(404).json({ message: "Invalid or expired share link" });
        }
        res.json(record);
    } catch (error) {
        console.error("GetSharedRecord Error:", error);
        res.status(500).json({ message: "Server error fetching shared record" });
    }
};

/**
 * @desc Stream/view a file from Cloudinary (auth required)
 * @route GET /api/records/:id/view
 * @access Private
 */
exports.streamRecordFile = async (req, res) => {
    try {
        const record = await Record.findById(req.params.id);
        if (!record) return res.status(404).json({ message: "Record not found" });

        if (record.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        // Redirect to Cloudinary URL for in-browser view
        return res.redirect(record.fileUrl);
    } catch (error) {
        console.error("StreamRecordFile Error:", error);
        res.status(500).json({ message: "Failed to stream file" });
    }
};

/**
 * @desc Download a file from Cloudinary with forced attachment (auth required)
 * @route GET /api/records/:id/download
 * @access Private
 */
exports.downloadRecordFile = async (req, res) => {
    try {
        const record = await Record.findById(req.params.id);
        if (!record) return res.status(404).json({ message: "Record not found" });

        if (record.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized" });
        }

        const dlUrl =
            record.fileUrl +
            (record.fileUrl.includes("?") ? "&" : "?") +
            "fl_attachment=1";
        return res.redirect(dlUrl);
    } catch (error) {
        console.error("DownloadRecordFile Error:", error);
        res.status(500).json({ message: "Failed to download file" });
    }
};

/**
 * @desc Public file access via share token
 * @route GET /api/records/shared/:token/file
 * @access Public
 */
exports.getSharedRecordFile = async (req, res) => {
    try {
        const record = await Record.findOne({ shareToken: req.params.token });
        if (!record) {
            return res.status(404).json({ message: "Invalid or expired share link" });
        }
        return res.redirect(record.fileUrl);
    } catch (error) {
        console.error("GetSharedRecordFile Error:", error);
        res.status(500).json({ message: "Failed to fetch shared file" });
    }
};
