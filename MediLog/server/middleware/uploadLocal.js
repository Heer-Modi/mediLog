const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 📁 Ensure uploads folder exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`✅ Created uploads directory at: ${uploadDir}`);
}

// 📦 Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeFileName = file.originalname.replace(/\s+/g, "_"); // replace spaces
    const uniqueName = `${timestamp}-${safeFileName}`;
    cb(null, uniqueName);
  },
});

// 🛡 File filter (optional: accept images, pdf, docs, etc.)
const fileFilter = (req, file, cb) => {
  // Example: accept any file type
  cb(null, true);
};

// 📤 Multer upload instance
const uploadLocal = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
});

module.exports = uploadLocal;
