const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const sendEmail = require('../utils/sendEmail'); // Import the email utility
const crypto = require('crypto'); // Import crypto for token generation
const asyncHandler = require('express-async-handler');

// @desc Register a new user
exports.registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error("User already exists");
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
        res.status(400);
        throw new Error("Invalid user data");
    }
});

// @desc Auth user & get token
exports.authUser = asyncHandler(async (req, res) => {
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
        res.status(401);
        throw new Error("Invalid email or password");
    }
});

// @desc Get user profile
exports.getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
});

// @desc Update user profile
exports.updateProfile = asyncHandler(async (req, res) => {
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
        res.status(404);
        throw new Error("User not found");
    }
});

// **NEW**: Forgot Password
exports.forgotPassword = asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        // Send a generic success message to prevent email enumeration
        return res.status(200).json({ message: 'If a user with that email exists, a password reset email has been sent.' });
    }

    // Generate a 6-digit code
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // Token expires in 10 minutes

    await user.save();

    const message = `
        <h1>Password Reset Request</h1>
        <p>You are receiving this email because you (or someone else) have requested the reset of a password.</p>
        <p>Your password reset code is:</p>
        <h2 style="color: #333; font-size: 24px; letter-spacing: 2px;">${resetToken}</h2>
        <p>This code will expire in 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
    `;

    try {
        await sendEmail({
            to: user.email,
            subject: 'MediLog Password Reset Code',
            html: message,
        });

        res.status(200).json({ message: 'Password reset email sent.' });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        res.status(500);
        throw new Error('Email could not be sent. Please try again later.');
    }
});


// **NEW**: Reset Password
exports.resetPassword = asyncHandler(async (req, res) => {
    const { code, password } = req.body;

    const user = await User.findOne({
        passwordResetToken: code,
        passwordResetExpires: { $gt: Date.now() }, // Check if token is not expired
    });

    if (!user) {
        res.status(400);
        throw new Error('Invalid or expired reset code.');
    }

    // Set new password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully.' });
});

// **NEW**: Get all doctors
// @desc    Get all users with the role 'doctor'
// @route   GET /api/users/doctors
// @access  Private
exports.getAllDoctors = asyncHandler(async (req, res) => {
    const doctors = await User.find({ role: 'doctor' }).select('_id name specialization');
    res.json(doctors);
});

