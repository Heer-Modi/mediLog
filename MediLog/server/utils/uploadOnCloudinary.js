const cloudinary = require("../config/cloudinary");
const fs = require("fs");

const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) return null;
  try {
    const res = await cloudinary.uploader.upload(localFilePath, { resource_type: "image", folder: "medilog_profiles" });
    return res.secure_url;
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    return null;
  } finally {
    try { fs.unlinkSync(localFilePath); } catch {}
  }
};

module.exports = uploadOnCloudinary;
