const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const sendEmail = require('../utils/sendEmail'); // Import the email utility
const User = require('../models/User'); // We need User model to get email

// @desc    Create a new event
// @route   POST /api/events
// @access  Private
const createEvent = asyncHandler(async (req, res) => {
  // **MODIFIED**: Added 'doctor'
  const { title, description, eventType, startDate, endDate, recurring, doctor } = req.body;

  if (!title || !eventType || !startDate) {
    res.status(400);
    throw new Error('Please provide title, eventType, and startDate');
  }
  
  // **MODIFIED**: Added 'doctor' to the new event object
  const event = new Event({
    user: req.user._id, // Assumes `protect` middleware adds user to req
    title,
    description,
    eventType,
    startDate,
    endDate: endDate || startDate, // Ensures endDate is not null
    recurring,
    doctor: eventType === 'appointment' ? doctor : null,
    // The 'status' field will be automatically set to 'pending' by the 'pre-save' hook in your Event.js model
  });

  const createdEvent = await event.save();

  // **MODIFIED**: Send email based on event type
  const user = await User.findById(req.user._id);
  if (user) {
      let emailSubject = '';
      let emailMessage = '';

      if (createdEvent.eventType === 'appointment') {
          // Send a "request sent" email for appointments
          const doctorDetails = await User.findById(createdEvent.doctor);
          emailSubject = `Appointment Request Sent: ${createdEvent.title}`;
          emailMessage = `
            <h1>Hi ${user.name},</h1>
            <p>Your appointment request has been sent to <b>Dr. ${doctorDetails ? doctorDetails.name : 'the doctor'}</b>.</p>
            <p>You will receive another email once your request is confirmed.</p>
            <hr/>
            <p><b>Event:</b> ${createdEvent.title}</p>
            <p><b>Time:</b> ${new Date(createdEvent.startDate).toLocaleString()}</p>
            <p><b>Status:</b> ${createdEvent.status}</p>
            <hr/>
          `;
      } else {
          // Send a "scheduled" email for medicine reminders
          emailSubject = `Event Scheduled: ${createdEvent.title}`;
          emailMessage = `
            <h1>Hi ${user.name},</h1>
            <p>This is a confirmation that a new medicine reminder has been scheduled.</p>
            <hr/>
            <p><b>Event:</b> ${createdEvent.title}</p>
            <p><b>Time:</b> ${new Date(createdEvent.startDate).toLocaleString()}</p>
            <hr/>
          `;
      }

      try {
          await sendEmail({
              to: user.email,
              subject: emailSubject,
              html: emailMessage,
          });
      } catch (emailError) {
          console.error(`Failed to send email for new event ${createdEvent._id}:`, emailError);
      }
  }

  res.status(201).json(createdEvent);
});

// @desc    Get all events for a logged-in user
// @route   GET /api/events
// @access  Private
const getEvents = asyncHandler(async (req, res) => {
  // We will populate the doctor's name for all events
  const events = await Event.find({ user: req.user._id }).populate('doctor', 'name specialization');
  res.json(events);
});

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private
const updateEvent = asyncHandler(async (req, res) => {
  const { title, description, eventType, startDate, endDate, recurring, isCompleted, doctor } = req.body;

  const event = await Event.findById(req.params.id);

  if (event) {
    if (event.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to update this event');
    }
    
    // A patient can only update an appointment if it is still 'pending'
    if (event.eventType === 'appointment' && event.status !== 'pending') {
        res.status(400);
        throw new Error('Cannot update an already approved or denied appointment.');
    }

    event.title = title || event.title;
    event.description = description || event.description;
    event.eventType = eventType || event.eventType;
    event.startDate = startDate || event.startDate;
    event.endDate = endDate || event.endDate;
    event.recurring = recurring !== undefined ? recurring : event.recurring;
    event.isCompleted = isCompleted !== undefined ? isCompleted : event.isCompleted;
    
    if (event.eventType === 'appointment') {
        event.doctor = doctor;
    } else {
        event.doctor = undefined; 
    }

    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } else {
    res.status(404);
    throw new Error('Event not found');
  }
});

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (event) {
    if (event.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to delete this event');
    }

    // A patient can only delete an appointment if it is still 'pending'
    if (event.eventType === 'appointment' && event.status !== 'pending') {
        res.status(400);
        throw new Error('Cannot delete an already approved or denied appointment. Please contact your doctor.');
    }

    await event.deleteOne(); 
    res.json({ message: 'Event removed' });
  } else {
    res.status(404);
    throw new Error('Event not found');
  }
});

module.exports = {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
};

