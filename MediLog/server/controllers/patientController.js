const User = require("../models/User");
const uploadOnCloudinary = require("../utils/uploadOnCloudinary");

// Save or update patient profile
exports.savePatientProfile = async (req, res) => {
  try {
    // Basic fields (strings in multipart -> coerce later as needed)
    const { phone, address, gender } = req.body;

    // age may arrive as string
    const age = req.body.age !== undefined && req.body.age !== null && req.body.age !== ""
      ? Number(req.body.age)
      : undefined;

    // medicalHistory may be comma-separated or array
    let medicalHistory = req.body.medicalHistory;
    if (typeof medicalHistory === "string") {
      medicalHistory = medicalHistory
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);
    } else if (!Array.isArray(medicalHistory)) {
      medicalHistory = [];
    }

    // emergencyInfo can come nested (emergencyInfo.xxx) or flat
    const emergency = {
      bloodGroup:
        req.body["emergencyInfo.bloodGroup"] ??
        req.body.bloodGroup ??
        (req.body.emergencyInfo && req.body.emergencyInfo.bloodGroup),
      allergies:
        req.body["emergencyInfo.allergies"] ??
        req.body.allergies ??
        (req.body.emergencyInfo && req.body.emergencyInfo.allergies),
      contactNumber:
        req.body["emergencyInfo.contactNumber"] ??
        req.body.contactNumber ??
        (req.body.emergencyInfo && req.body.emergencyInfo.contactNumber),
    };

    // Upload photo if present
    let photoUrl;
    if (req.file) {
      photoUrl = await uploadOnCloudinary(req.file.path);
    }

    const update = {
      ...(phone !== undefined && { phone }),
      ...(address !== undefined && { address }),
      ...(gender !== undefined && { gender }),
      ...(age !== undefined && !Number.isNaN(age) && { age }),
      ...(medicalHistory && { medicalHistory }),
      emergencyInfo: emergency, // overwrite as a block; controller always sends an object
      ...(photoUrl && { photo: photoUrl }),
    };

    const patient = await User.findByIdAndUpdate(req.user.id, update, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!patient) return res.status(404).json({ message: "Patient not found" });

    res.status(200).json({ message: "Patient profile saved", patient });
  } catch (err) {
    console.error("Error saving patient profile:", err);
    res.status(500).json({ message: "Error saving patient profile" });
  }
};

// Fetch patient profile
exports.fetchPatientProfile = async (req, res) => {
  try {
    const patient = await User.findById(req.user.id).select("-password");
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.status(200).json({ patient });
  } catch (err) {
    res.status(500).json({ message: "Error fetching patient profile" });
  }
};
