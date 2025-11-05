const express = require('express');
const {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Route to get all events for the logged-in user and create a new event
router.route('/')
  .get(protect, getEvents)
  .post(protect, createEvent);

// Route to update a specific event and delete a specific event
router.route('/:id')
  .put(protect, updateEvent)
  .delete(protect, deleteEvent);

module.exports = router;
