// server/middleware/uploadCloudinary.js
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

/**
 * Allowed MIME types for file uploads
 */
const allowedTypes = [
  "image/jpeg",
  "image/png",
  "application/pdf",
  "image/jpg"
];

/**
 * Multer file filter for validation BEFORE uploading to Cloudinary
 * - Checks category presence
 * - Checks file type validity
 */
const fileFilter = (req, file, cb) => {
  // Category must be present in the body for your Record schema
  if (!req.body || !req.body.category) {
    return cb(new Error("Category is required when uploading a record."), false);
  }

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPG, PNG, and PDF files are allowed."),
      false
    );
  }
};

/**
 * Cloudinary storage engine for multer
 * - Uploads to cloudinary folder "mediLog-records/<category>"
 * - Restricts formats to ones allowed in fileFilter
 */
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = "mediLog-records";
    // Category is already validated in fileFilter
    folder = `mediLog-records/${req.body.category}`;
    return {
      folder,
      allowed_formats: ["jpg", "png", "pdf", "jpeg"],
      resource_type: "auto", // auto-detect file type
    };
  },
});

/**
 * Upload middleware: single file under field "file"
 */
const uploadCloudinary = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // optional: limit size to 10MB
  },
});

module.exports = uploadCloudinary;
