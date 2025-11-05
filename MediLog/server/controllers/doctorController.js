// controllers/doctorController.js
const User = require("../models/User");
const Event = require("../models/Event");
const Record = require("../models/Record");
const cloudinary = require("../config/cloudinary");
const fs = require("fs").promises;
const asyncHandler = require('express-async-handler');
const sendEmail = require('../utils/sendEmail'); // **NEW**: Import sendEmail

// Save or update doctor profile
exports.saveDoctorProfile = asyncHandler(async (req, res) => {
  const { designation, department, specialization, phone, experience } = req.body;

  let photoUrl;
  if (req.file) {
    try {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "medilog_profiles",
      });
      photoUrl = uploadResult.secure_url;
      await fs.unlink(req.file.path); // delete temp file
    } catch (uploadError) {
      console.error("Cloudinary Upload Error:", uploadError);
      res.status(500);
      throw new Error("Error uploading profile photo");
    }
  }

  const doctor = await User.findByIdAndUpdate(
    req.user.id,
    {
      designation,
      department,
      specialization,
      phone,
      experience, 
      ...(photoUrl && { photo: photoUrl }),
    },
    { new: true }
  ).select("-password");

  if (!doctor) {
    res.status(404);
    throw new Error("Doctor not found");
  }

  res.status(200).json({ message: "Doctor profile saved", doctor });
});

// Fetch doctor profile
exports.fetchDoctorProfile = asyncHandler(async (req, res) => {
  const doctor = await User.findById(req.user.id).select("-password");
  if (!doctor) {
    res.status(404);
    throw new Error("Doctor not found");
  }
  res.status(200).json({ doctor });
});

// --- DASHBOARD FUNCTIONS ---

/**
 * @desc    Get dashboard statistics for a doctor
 * @route   GET /api/doctors/dashboard/stats
 * @access  Private (Doctor)
 */
exports.getDoctorStats = asyncHandler(async (req, res) => {
    const doctorId = req.user._id;
    const patientList = await Record.distinct("user", { sharedWith: doctorId });
    const totalPatients = patientList.length;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    // **MODIFIED**: Only count 'approved' appointments
    const todaysAppointments = await Event.countDocuments({
        eventType: 'appointment',
        doctor: doctorId,
        status: 'approved', // Only count approved
        startDate: { $gte: todayStart, $lt: todayEnd },
    });

    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    // **MODIFIED**: Only count 'approved' and 'completed' appointments
    const recentConsultations = await Event.countDocuments({
        eventType: 'appointment',
        doctor: doctorId,
        status: 'approved', // Only count approved
        isCompleted: true,
        startDate: { $gte: last30Days },
    });

    res.json({
        totalPatients,
        todaysAppointments,
        recentConsultations,
    });
});

/**
 * @desc    Get upcoming appointments for a doctor (for dashboard)
 * @route   GET /api/doctors/dashboard/appointments
 * @access  Private (Doctor)
 */
exports.getUpcomingAppointments = asyncHandler(async (req, res) => {
    const upcoming = await Event.find({
        eventType: 'appointment',
        doctor: req.user._id, // Find appointments for this doctor
        status: 'approved', // **MODIFIED**: Only show 'approved'
        startDate: { $gte: new Date() }, 
    })
    .populate('user', 'name photo') 
    .sort({ startDate: 1 }) 
    .limit(5); 

    res.json(upcoming);
});

/**
 * @desc    Get patient records for a doctor (dashboard hub)
 * @route   GET /api/doctors/dashboard/records
 * @access  Private (Doctor)
 */
exports.getPatientRecords = asyncHandler(async (req, res) => {
    const records = await Record.find({
        sharedWith: req.user._id 
    })
    .populate('user', 'name')
    .sort({ createdAt: -1 }) 
    .limit(10); 

    res.json(records);
});

// --- "YOUR PATIENTS" PAGE FUNCTIONS ---

exports.getMyPatients = asyncHandler(async (req, res) => {
    const patientIds = await Record.distinct("user", { sharedWith: req.user._id });
    const patients = await User.find({
        _id: { $in: patientIds }
    }).select('name email photo emergencyInfo phone address gender age'); 
    res.json(patients);
});

exports.getSharedRecordsForPatient = asyncHandler(async (req, res) => {
    const { patientId } = req.params;
    const records = await Record.find({
        user: patientId,
        sharedWith: req.user._id
    }).select('title category date fileUrl');
    res.json(records);
});

// --- "APPOINTMENTS" PAGE FUNCTIONS ---

/**
 * @desc    Get all appointments assigned to the doctor (pending, approved, etc.)
 * @route   GET /api/doctors/appointments
 * @access  Private (Doctor)
 */
exports.getDoctorAppointments = asyncHandler(async (req, res) => {
    const appointments = await Event.find({
      doctor: req.user._id,
      eventType: 'appointment'
    })
    .populate('user', 'name email photo') 
    .sort({ status: 1, startDate: 1 }); // Sort by status (pending first), then by date
  
    res.json(appointments);
});

/**
 * @desc    Approve or Deny an appointment
 * @route   PUT /api/doctors/appointments/:id/status
 * @access  Private (Doctor)
 */
exports.updateAppointmentStatus = asyncHandler(async (req, res) => {
    const { status } = req.body; // Expecting 'approved' or 'denied'
    const { id } = req.params;

    if (!['approved', 'denied'].includes(status)) {
        res.status(400);
        throw new Error('Invalid status.');
    }

    const event = await Event.findById(id);

    if (!event) {
        res.status(404);
        throw new Error('Appointment not found');
    }

    // Check if the logged-in user is the correct doctor
    if (event.doctor.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to update this appointment');
    }

    // Update status
    event.status = status;
    await event.save();

    // Send confirmation/denial email to the patient
    const patient = await User.findById(event.user);
    if (patient) {
        const emailSubject = `Appointment ${status.charAt(0).toUpperCase() + status.slice(1)}: ${event.title}`;
        const emailMessage = `
            <h1>Hi ${patient.name},</h1>
            <p>Your appointment request for <b>${event.title}</b> on <b>${new Date(event.startDate).toLocaleString()}</b> has been <b>${status}</b>.</p>
            ${status === 'approved' ? '<p>We look forward to seeing you!</p>' : '<p>Please visit your MediLog portal to reschedule if necessary.</p>'}
        `;
        
        try {
            await sendEmail({
                to: patient.email,
                subject: emailSubject,
                html: emailMessage,
            });
        } catch (emailError) {
            console.error(`Failed to send status update email for event ${event._id}:`, emailError);
        }
    }

    res.json(event);
});

