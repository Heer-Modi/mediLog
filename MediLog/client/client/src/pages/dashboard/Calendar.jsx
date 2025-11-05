import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Modal,
  TextField,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Button,
  Typography,
  Box // Import Box for styling
} from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import Sidebar from '/src/components/Sidebar.jsx'; // **FIXED**: Using absolute path
import '/src/styles/calendar.css'; // **FIXED**: Using absolute path

const API_BASE = 'http://localhost:5000';

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  
  const [doctorList, setDoctorList] = useState([]);
  const [modalError, setModalError] = useState(''); 

  const [newEventData, setNewEventData] = useState({
    title: '',
    description: '',
    eventType: 'medicine',
    time: '09:00',
    recurring: false,
    isCompleted: false,
    doctor: '', 
    status: 'approved', // Default status
  });

  const getToken = () => JSON.parse(localStorage.getItem('userInfo'))?.token;

  // --- DATA FETCHING ---
  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) return;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await axios.get(`${API_BASE}/api/events`, config);
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDoctors = useCallback(async () => {
    try {
        const token = getToken();
        if (!token) return;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await axios.get(`${API_BASE}/api/users/doctors`, config);
        setDoctorList(data || []);
    } catch (error) {
        console.error('Error fetching doctors:', error);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    fetchDoctors(); 
  }, [fetchEvents, fetchDoctors]);

  // --- MODAL CONTROLS ---
  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedEvent(null);
    setSelectedDate(null);
    setModalError(''); 
  };

  const handleDayClick = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(date);
    setSelectedEvent(null);
    setNewEventData({
      title: '',
      description: '',
      eventType: 'medicine',
      time: '09:00',
      recurring: false,
      isCompleted: false,
      doctor: '', 
      status: 'approved', // Default for new
    });
    setModalOpen(true);
  };
  
  const handleEventClick = (event) => {
    setSelectedEvent(event);
    const eventDate = new Date(event.startDate);
    setNewEventData({
        ...event,
        time: `${String(eventDate.getHours()).padStart(2, '0')}:${String(eventDate.getMinutes()).padStart(2, '0')}`,
        doctor: event.doctor?._id || '', 
    });
    setModalOpen(true);
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewEventData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  // --- API ACTIONS ---
  const handleSaveEvent = async () => {
    setModalError(''); 

    // Validation
    if (newEventData.eventType === 'appointment' && !newEventData.doctor) {
        setModalError('Please select a doctor for the appointment.');
        return;
    }
    if (!newEventData.title) {
        setModalError('Please enter a title for the event.');
        return;
    }

    const token = getToken();
    if (!token) return;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    const [hours, minutes] = newEventData.time.split(':');
    const eventDate = selectedEvent ? new Date(selectedEvent.startDate) : selectedDate;
    eventDate.setHours(hours);
    eventDate.setMinutes(minutes);

    const eventPayload = { 
        ...newEventData, 
        startDate: eventDate, 
        endDate: eventDate,
        doctor: newEventData.eventType === 'appointment' ? newEventData.doctor : null,
    };

    try {
      if (selectedEvent) {
        // Update existing event
        await axios.put(`${API_BASE}/api/events/${selectedEvent._id}`, eventPayload, config);
        alert('Event updated successfully!');
      } else {
        // Create new event
        const { data } = await axios.post(`${API_BASE}/api/events`, eventPayload, config);
        // **MODIFIED**: Show correct message based on event type
        if (data.eventType === 'appointment') {
            alert('Appointment request sent to doctor for approval!');
        } else {
            alert('Medicine reminder saved!');
        }
      }
      fetchEvents();
      handleModalClose();
    } catch (error) {
      console.error('Error saving event:', error);
      setModalError(error.response?.data?.message || 'Failed to save event. Please try again.');
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    setModalError('');

    // **MODIFIED**: Check if appointment is deletable
    if (selectedEvent.eventType === 'appointment' && selectedEvent.status !== 'pending') {
        setModalError('Cannot delete an appointment that is already approved or denied.');
        return;
    }

    const token = getToken();
    if (!token) return;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      await axios.delete(`${API_BASE}/api/events/${selectedEvent._id}`, config);
      fetchEvents();
      handleModalClose();
    } catch (error) {
      console.error("Error deleting event:", error);
      setModalError(error.response?.data?.message || "Failed to delete event.");
    }
  };

  // --- RENDER FUNCTIONS ---
  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const blanks = Array(firstDay).fill(null);
    const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
      <div className="calendarGrid">
        <div className="calendarWeekdays">
          {weekdays.map(day => <div className="weekday" key={day}>{day}</div>)}
        </div>
        <div className="calendarDays">
          {blanks.map((_, i) => <div key={`blank-${i}`} className="calendarDay" style={{ visibility: 'hidden' }} />)}
          {monthDays.map(day => {
            const dayEvents = events.filter(e => {
                const eventDate = new Date(e.startDate);
                return eventDate.getDate() === day && eventDate.getMonth() === month && eventDate.getFullYear() === year;
            });
            return (
              <div key={day} onClick={() => handleDayClick(day)} className="calendarDay">
                <div className="dayNumber">{day}</div>
                {dayEvents.map(event => {
                  // **NEW**: Add class based on status
                  const isPending = event.eventType === 'appointment' && event.status === 'pending';
                  const eventClass = `eventBubble ${event.eventType} ${isPending ? 'pending' : ''}`;
                  
                  return (
                    <div 
                      key={event._id} 
                      onClick={(e) => { e.stopPropagation(); handleEventClick(event); }} 
                      className={eventClass}
                    >
                      {event.title}
                      {event.eventType === 'appointment' && event.doctor && (
                          <span className="eventDoctorName">w/ Dr. {event.doctor.name.split(' ').pop()}</span>
                      )}
                      {/* **NEW**: Show pending status */}
                      {isPending && (
                          <span className="eventStatus">(Pending)</span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  if (loading) {
      return (
        <div className="calendarContainer">
            <Sidebar />
            <div className="calendarMainContent" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress />
            </div>
        </div>
      )
  }

  // **NEW**: Check if modal should be read-only
  const isReadOnly = selectedEvent && selectedEvent.eventType === 'appointment' && selectedEvent.status !== 'pending';

  return (
    <div className="calendarContainer">
      <Sidebar />
      <div className="calendarMainContent">
        <div className="calendarCard">
          <div className="calendarHeader">
            <button className="calendarNavButton" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>
              <ChevronLeft />
            </button>
            <h4>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h4>
            <button className="calendarNavButton" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>
              <ChevronRight />
            </button>
          </div>
          {renderCalendar()}
        </div>
      </div>

      <Modal open={modalOpen} onClose={handleModalClose} className="eventModal">
        <div className="modalContent">
          <h3>{selectedEvent ? 'Edit Event' : 'Add New Event'}</h3>
          
          {/* **NEW**: Show status if event is an appointment */}
          {selectedEvent && newEventData.eventType === 'appointment' && (
            <Box className={`eventStatusChip ${newEventData.status}`}>
              Status: {newEventData.status}
            </Box>
          )}

          <TextField 
            label="Title" 
            name="title" 
            value={newEventData.title} 
            onChange={handleInputChange} 
            fullWidth 
            margin="normal" 
            disabled={isReadOnly}
          />
          <TextField 
            label="Description" 
            name="description" 
            value={newEventData.description} 
            onChange={handleInputChange} 
            fullWidth 
            margin="normal"
            disabled={isReadOnly}
          />
          <FormControl fullWidth margin="normal" disabled={isReadOnly}>
            <InputLabel>Event Type</InputLabel>
            <Select name="eventType" value={newEventData.eventType} label="Event Type" onChange={handleInputChange}>
              <MenuItem value="medicine">Medicine</MenuItem>
              <MenuItem value="appointment">Appointment</MenuItem>
            </Select>
          </FormControl>
          <TextField 
            label="Time" 
            name="time" 
            type="time" 
            value={newEventData.time} 
            onChange={handleInputChange} 
            InputLabelProps={{ shrink: true }} 
            fullWidth 
            margin="normal"
            disabled={isReadOnly}
          />
          
          {newEventData.eventType === 'appointment' && (
            <FormControl fullWidth margin="normal" disabled={isReadOnly}>
                <InputLabel id="doctor-select-label">Select Doctor</InputLabel>
                <Select
                    labelId="doctor-select-label"
                    name="doctor"
                    value={newEventData.doctor}
                    label="Select Doctor"
                    onChange={handleInputChange}
                >
                    <MenuItem value=""><em>None</em></MenuItem>
                    {doctorList.length > 0 ? (
                        doctorList.map((doc) => (
                            <MenuItem key={doc._id} value={doc._id}>
                                Dr. {doc.name} {doc.specialization && `(${doc.specialization})`}
                            </MenuItem>
                        ))
                    ) : (
                        <MenuItem disabled>Loading doctors...</MenuItem>
                    )}
                </Select>
            </FormControl>
          )}

          {newEventData.eventType === 'medicine' && (
            <>
              <FormControlLabel 
                control={<Checkbox checked={newEventData.recurring} onChange={handleInputChange} name="recurring" />} 
                label="Recurring Daily" 
              />
              <FormControlLabel 
                control={<Checkbox checked={newEventData.isCompleted} onChange={handleInputChange} name="isCompleted" />} 
                label="Mark as Taken" 
              />
            </>
          )}
          
          {modalError && (
              <Typography color="error" style={{ fontSize: '0.9rem', textAlign: 'center', marginTop: '10px' }}>
                  {modalError}
              </Typography>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
            {/* **MODIFIED**: Hide save/delete if not editable */}
            {!isReadOnly && (
              <Button variant="contained" color="primary" onClick={handleSaveEvent}>
                {selectedEvent ? 'Save Changes' : 'Create Event'}
              </Button>
            )}
            {selectedEvent && !isReadOnly && (
              <Button variant="contained" color="error" onClick={handleDeleteEvent}>
                Delete
              </Button>
            )}
            <Button onClick={handleModalClose}>
              {isReadOnly ? 'Close' : 'Cancel'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Calendar;

