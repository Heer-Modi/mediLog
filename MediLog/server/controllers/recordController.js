const Record = require("../models/Record");
const crypto = require("crypto");
const cloudinary = require("../config/cloudinary");

// Get all records
exports.getRecords = async (req, res) => {
    const records = await Record.find({ user: req.user.id });
    res.json(records);
};

// Create a new record (upload to Cloudinary)
exports.createRecord = async (req, res) => {
    const { title, description } = req.body;

    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    const shareToken = crypto.randomBytes(16).toString("hex");

    const record = await Record.create({
        user: req.user.id,
        title,
        description,
        fileUrl: req.file.path,
        cloudinaryId: req.file.filename,
        shareToken
    });

    res.status(201).json(record);
};

// Delete a record (also delete from Cloudinary)
exports.deleteRecord = async (req, res) => {
    const record = await Record.findById(req.params.id);

    if (!record || record.user.toString() !== req.user.id) {
        return res.status(404).json({ message: "Record not found or not authorized" });
    }

    if (record.cloudinaryId) {
        await cloudinary.uploader.destroy(record.cloudinaryId);
    }

    await record.deleteOne();
    res.json({ message: "Record removed" });
};

// Get record by share token
exports.getSharedRecord = async (req, res) => {
    const record = await Record.findOne({ shareToken: req.params.token });

    if (!record) {
        return res.status(404).json({ message: "Invalid or expired token" });
    }

    res.json(record);
};
