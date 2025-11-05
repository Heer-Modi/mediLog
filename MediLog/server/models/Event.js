const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // This is the Patient who created the event
    },
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    eventType: {
      type: String,
      required: true,
      enum: ["medicine", "appointment"],
      default: "medicine",
    },
    startDate: {
      type: Date,
      required: [true, "Event start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "Event end date is required"],
    },
    recurring: {
      type: Boolean, // Corrected from String to Boolean
      default: false,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Optional, as it only applies to 'appointment' types
    },

    // **NEW FIELD** for appointment approval workflow
    status: {
      type: String,
      enum: ['pending', 'approved', 'denied'],
      default: 'approved', // Default to 'approved' for medicine reminders
      required: true,
    }
  },
  { timestamps: true }
);

// When a new event is saved, set status to 'pending' if it's an appointment
eventSchema.pre('save', function(next) {
  if (this.isNew && this.eventType === 'appointment') {
    this.status = 'pending';
  }
  next();
});

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;

