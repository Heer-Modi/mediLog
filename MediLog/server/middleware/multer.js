// uploadLocal.js
const multer = require("multer");
const path = require("path");

// Configure storage location + filename
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads")); // folder where files will be saved
  },
  filename: function (req, file, cb) {
    // Save file with original name
    cb(null, Date.now() + "-" + file.originalname.trim());
  }
});

// Create the multer instance
const uploadLocal = multer({ storage: storage });

module.exports = uploadLocal;
