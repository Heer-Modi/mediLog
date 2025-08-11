const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, default: Date.now },
    fileUrl: { type: String }, // public Cloudinary URL
    cloudinaryId: { type: String }, // Cloudinary file ID
    shareToken: { type: String, unique: true }, // for sharing with doctor
    category: { type: String, required: true } // new field for folder/category
}, { timestamps: true });

module.exports = mongoose.model("Record", recordSchema);
