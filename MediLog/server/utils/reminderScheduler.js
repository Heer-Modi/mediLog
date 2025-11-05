const cron = require('node-cron');
const Event = require('../models/Event');
const User = require('../models/User');
const sendEmail = require('./sendEmail');

// This task will run every 5 minutes
const startScheduler = () => {
  cron.schedule('*/5 * * * *', async () => {
    console.log('Running a check for missed reminders...');
    const now = new Date();

    try {
      // Find events that are:
      // 1. In the past
      // 2. Not completed
      // 3. Haven't had a reminder email sent yet
      const missedEvents = await Event.find({
        startDate: { $lt: now },
        isCompleted: false,
        reminderSent: false,
      }).populate('user', 'email name');

      if (missedEvents.length === 0) {
        console.log('No missed reminders found.');
        return;
      }

      console.log(`Found ${missedEvents.length} missed reminders to process.`);

      for (const event of missedEvents) {
        const message = `
          <h1>Hi ${event.user.name},</h1>
          <p>This is a friendly reminder that you seem to have missed a scheduled event:</p>
          <hr/>
          <p><b>Event:</b> ${event.title}</p>
          <p><b>Time:</b> ${new Date(event.startDate).toLocaleString()}</p>
          <p>Please remember to update your schedule in the MediLog portal.</p>
          <hr/>
          <p>Stay healthy!</p>
        `;

        try {
          await sendEmail({
            to: event.user.email,
            subject: `Missed Reminder: ${event.title}`,
            html: message,
          });

          // Mark that the reminder has been sent to prevent duplicates
          event.reminderSent = true;
          await event.save();
          console.log(`Sent missed reminder for "${event.title}" to ${event.user.email}`);

        } catch (emailError) {
          console.error(`Failed to send email for event ${event._id}:`, emailError);
        }
      }
    } catch (dbError) {
      console.error('Error fetching missed events from database:', dbError);
    }
  });
};

module.exports = startScheduler;
