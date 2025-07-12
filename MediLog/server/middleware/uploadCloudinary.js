const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "mediLog-records",
        allowed_formats: ["jpg", "png", "pdf", "jpeg"],
    },
});

const uploadCloudinary = multer({ storage });

module.exports = uploadCloudinary;
