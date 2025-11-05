const Record = require("../models/Record");
const User = require("../models/User"); // Import User model
const crypto = require("crypto");
const cloudinary = require("../config/cloudinary");
const path = require("path");
const fs = require("fs");
const asyncHandler = require("express-async-handler");

/**
 * @desc Get all records for the logged-in user
 * @route GET /api/records
 * @access Private
 */
exports.getRecords = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Unauthorized, please log in");
  }
  const records = await Record.find({ user: req.user.id });
  res.json(records);
});

/**
 * @desc Create a new record & upload to Cloudinary
 * @route POST /api/records
 * @access Private
 */
exports.createRecord = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Unauthorized, please log in");
  }

  const { title, description, category, date } = req.body;

  if (!req.file) {
    res.status(400);
    throw new Error("No file uploaded");
  }
  if (!category || !title || !date) {
    res.status(400);
    throw new Error("Category, title, and date are required");
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
});

/**
 * @desc Delete a record (and from Cloudinary)
 * @route DELETE /api/records/:id
 * @access Private
 */
exports.deleteRecord = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Unauthorized, please log in");
  }

  const record = await Record.findById(req.params.id);
  if (!record) {
    res.status(404);
    throw new Error("Record not found");
  }

  if (record.user.toString() !== req.user.id) {
    res.status(403);
    throw new Error("Not authorized to delete this record");
  }

  if (record.cloudinaryId) {
    await cloudinary.uploader.destroy(record.cloudinaryId);
  }

  await record.deleteOne();
  res.json({ message: "Record removed successfully" });
});

/**
 * @desc Get record info by share token (public metadata)
 * @route GET /api/records/shared/:token
 * @access Public
 */
exports.getSharedRecord = asyncHandler(async (req, res) => {
  const record = await Record.findOne({ shareToken: req.params.token });
  if (!record) {
    res.status(404);
    throw new Error("Invalid or expired share link");
  }
  res.json(record);
});

/**
 * @desc Stream/view a file from Cloudinary (auth required)
 * @route GET /api/records/:id/view
 * @access Private
 */
exports.streamRecordFile = asyncHandler(async (req, res) => {
    const record = await Record.findById(req.params.id);
    if (!record) {
        res.status(404);
        throw new Error("Record not found");
    }

    // **FIXED**: Authorization Check
    // Check if the user is the owner (patient)
    const isOwner = record.user.toString() === req.user.id;
    // Check if the user is a doctor the record was shared with
    const isSharedDoctor = record.sharedWith.some(id => id.toString() === req.user.id);

    if (!isOwner && !isSharedDoctor) {
        res.status(403);
        throw new Error("Not authorized");
    }

    // Redirect to Cloudinary URL for in-browser view
    return res.redirect(record.fileUrl);
});

/**
 * @desc Download a file from Cloudinary with forced attachment (auth required)
 * @route GET /api/records/:id/download
 * @access Private
 */
exports.downloadRecordFile = asyncHandler(async (req, res) => {
    const record = await Record.findById(req.params.id);
    if (!record) {
        res.status(404);
        throw new Error("Record not found");
    }

    // **FIXED**: Authorization Check
    const isOwner = record.user.toString() === req.user.id;
    const isSharedDoctor = record.sharedWith.some(id => id.toString() === req.user.id);

    if (!isOwner && !isSharedDoctor) {
        res.status(403);
        throw new Error("Not authorized");
    }

    const dlUrl =
        record.fileUrl +
        (record.fileUrl.includes("?") ? "&" : "?") +
        "fl_attachment=1";
    return res.redirect(dlUrl);
});

/**
 * @desc Public file access via share token
 * @route GET /api/records/shared/:token/file
 * @access Public
 */
exports.getSharedRecordFile = asyncHandler(async (req, res) => {
  const record = await Record.findOne({ shareToken: req.params.token });
  if (!record) {
    res.status(404);
    throw new Error("Invalid or expired share link");
  }
  return res.redirect(record.fileUrl);
});

exports.createRecordLocal = asyncHandler(async (req, res) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Unauthorized, please log in");
  }

  const { title, description, category, date } = req.body;

  if (!req.file) {
    res.status(400);
    throw new Error("No file uploaded");
  }
  if (!category || !title || !date) {
    res.status(400);
    throw new Error("Category, title, and date are required");
  }

  const record = await Record.create({
    user: req.user.id,
    title,
    description,
    category,
    date,
    fileUrl: req.file.path,
  });

  res.status(201).json(record);
});

exports.streamLocalRecord = asyncHandler(async (req, res) => {
    const record = await Record.findById(req.params.id);
    if (!record) {
        return res.status(404).json({ message: "Record not found" });
    }

    // **FIXED**: Authorization Check
    // Check if the user is the owner (patient)
    const isOwner = record.user.toString() === req.user.id;
    // Check if the user is a doctor the record was shared with
    const isSharedDoctor = record.sharedWith.some(id => id.toString() === req.user.id);

    if (!isOwner && !isSharedDoctor) {
        // This is the line (approx 202) that was causing the error
        return res.status(403).json({ message: "Not authorized" });
    }

    const absolutePath = path.resolve(record.fileUrl);

    // if (!fs.existsSync(absolutePath)) {
    // 	 return res.status(404).json({ message: "File not found" });
    // }

    // Set content type based on file extension
    if (absolutePath.endsWith(".pdf")) {
        res.setHeader("Content-Type", "application/pdf");
    } else if (absolutePath.match(/\.(jpg|jpeg|png|gif)$/i)) {
        res.setHeader("Content-Type", "image/jpeg");
    } else {
        res.setHeader("Content-Type", "application/octet-stream");
    }

    res.sendFile(absolutePath);
});

/**
 * @desc    Share a record with a specific doctor
 * @route   POST /api/records/:id/share
 * @access  Private
 */
exports.shareRecordWithDoctor = asyncHandler(async (req, res) => {
    const { doctorId } = req.body;
    const record = await Record.findById(req.params.id);

    if (!record) {
        res.status(404);
        throw new Error('Record not found');
    }

    // Check if the logged-in user owns the record
    if (record.user.toString() !== req.user.id) {
        res.status(403);
        throw new Error('Not authorized to share this record');
    }

    // Check if the doctorId is valid and belongs to a doctor
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
        res.status(404);
        throw new Error('Doctor not found');
    }

    // Add the doctor's ID to the sharedWith array (if not already present)
    const updatedRecord = await Record.findByIdAndUpdate(
        req.params.id,
        { $addToSet: { sharedWith: doctorId } },
        { new: true }
    );

    res.json({ message: 'Record shared successfully', record: updatedRecord });
});

