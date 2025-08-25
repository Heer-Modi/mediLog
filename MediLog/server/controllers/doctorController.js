// controllers/doctorController.js
const User = require("../models/User");
const cloudinary = require("../utils/uploadOnCloudinary");
const fs = require("fs");

// Save or update doctor profile
exports.saveDoctorProfile = async (req, res) => {
  try {
    const { designation, department, specialization, phone } = req.body;

    let photoUrl;
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "medilog_profiles",
      });
      photoUrl = uploadResult.secure_url;
      fs.unlinkSync(req.file.path); // delete temp file
    }

    const doctor = await User.findByIdAndUpdate(
      req.user.id,
      {
        designation,
        department,
        specialization,
        phone,
        ...(photoUrl && { photo: photoUrl }),
      },
      { new: true }
    ).select("-password");

    res.status(200).json({ message: "Doctor profile saved", doctor });
  } catch (err) {
    console.error("Error saving doctor profile:", err);
    res.status(500).json({ message: "Error saving doctor profile" });
  }
};

// Fetch doctor profile
exports.fetchDoctorProfile = async (req, res) => {
  try {
    const doctor = await User.findById(req.user.id).select("-password");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    res.status(200).json({ doctor });
  } catch (err) {
    res.status(500).json({ message: "Error fetching doctor profile" });
  }
};
