const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// @desc Register a new user
exports.registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({ name, email, password, role });
    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: "Invalid user data" });
    }
};

// @desc Auth user & get token
exports.authUser = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: "Invalid email or password" });
    }
};

// @desc Get user profile
exports.getProfile = async (req, res) => {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
};

// @desc Update user profile
exports.updateProfile = async (req, res) => {
    const user = await User.findById(req.user.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        if (req.body.emergencyInfo) {
            user.emergencyInfo.bloodGroup =
                req.body.emergencyInfo.bloodGroup || user.emergencyInfo.bloodGroup;
            user.emergencyInfo.allergies =
                req.body.emergencyInfo.allergies || user.emergencyInfo.allergies;
            user.emergencyInfo.contactNumber =
                req.body.emergencyInfo.contactNumber || user.emergencyInfo.contactNumber;
        }

        if (req.body.password) {
            user.password = req.body.password; // pre-save hook will hash it
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            emergencyInfo: updatedUser.emergencyInfo,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404).json({ message: "User not found" });
    }
};
