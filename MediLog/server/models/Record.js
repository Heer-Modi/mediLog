const mongoose = require("mongoose");

const recordSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, default: Date.now },
    fileUrl: { type: String }, // public Cloudinary URL
    cloudinaryId: { type: String }, // Cloudinary file ID
    shareToken: { type: String }, // for sharing with doctor (no unique)
    category: { type: String, required: true } // new field for folder/category
}, { timestamps: true });

// Remove any existing index on shareToken if it exists
recordSchema.index({ shareToken: 1 }, { unique: false });

const Record = mongoose.model("Record", recordSchema);

// Ensure indexes are in sync with the schema
Record.syncIndexes().then(() => {
    console.log("Indexes synchronized successfully");
}).catch(err => {
    console.error("Error syncing indexes:", err);
});

module.exports = Record;
