const mongoose = require('mongoose');

const CalendarEventSchema = new mongoose.Schema({
  // Event ownership
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  
  // Event basic info
  title: { type: String, required: true },
  description: String,
  
  // Event timing
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isAllDay: { type: Boolean, default: false },
  timezone: { type: String, default: 'UTC' },
  
  // Event type and category
  type: {
    type: String,
    enum: [
      'trip',           // Trip dates
      'flight',         // Flight bookings
      'accommodation',  // Hotel/lodging bookings
      'activity',       // Planned activities
      'meeting',        // Travel-related meetings
      'reminder',       // Personal reminders
      'deadline',       // Booking deadlines
      'other'           // Custom events
    ],
    default: 'other'
  },
  category: {
    type: String,
    enum: [
      'travel',
      'accommodation', 
      'transportation',
      'activity',
      'dining',
      'meeting',
      'reminder',
      'personal'
    ],
    default: 'personal'
  },
  
  // Related entities
  relatedTrip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
  relatedItinerary: { type: mongoose.Schema.Types.ObjectId, ref: 'Itinerary' },
  relatedExpense: { type: mongoose.Schema.Types.ObjectId, ref: 'Expense' },
  
  // Location info
  location: String,
  address: String,
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  
  // Event details
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'cancelled', 'completed'],
    default: 'scheduled'
  },
  color: { 
    type: String, 
    default: '#3B82F6' // Blue color
  },
  
  // Booking and cost info
  bookingInfo: {
    confirmationNumber: String,
    bookingUrl: String,
    cost: Number,
    currency: { type: String, default: 'USD' },
    isPaid: { type: Boolean, default: false },
    paymentDue: Date,
    vendor: String,
    contactInfo: String
  },
  
  // Reminders
  reminders: [{
    type: {
      type: String,
      enum: ['email', 'notification', 'sms'],
      default: 'notification'
    },
    minutes: { type: Number, default: 60 }, // Minutes before event
    sent: { type: Boolean, default: false },
    sentAt: Date
  }],
  
  // Recurrence (for repeating events)
  recurrence: {
    isRecurring: { type: Boolean, default: false },
    pattern: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly']
    },
    interval: { type: Number, default: 1 }, // Every N days/weeks/months
    endDate: Date,
    daysOfWeek: [Number], // 0=Sunday, 1=Monday, etc.
    dayOfMonth: Number, // For monthly recurrence
    exceptions: [Date] // Dates to skip
  },
  
  // Sharing and collaboration
  isShared: { type: Boolean, default: false },
  sharedWith: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    permission: { 
      type: String, 
      enum: ['view', 'edit'], 
      default: 'view' 
    }
  }],
  
  // Attendees (for meetings/group activities)
  attendees: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'tentative'],
      default: 'pending'
    },
    role: {
      type: String,
      enum: ['organizer', 'attendee', 'optional'],
      default: 'attendee'
    }
  }],
  
  // Additional metadata
  tags: [String],
  notes: String,
  attachments: [{
    name: String,
    url: String,
    type: String, // file type
    size: Number  // file size in bytes
  }],
  
  // External integration
  externalId: String, // For syncing with external calendars
  source: {
    type: String,
    enum: ['manual', 'trip_import', 'booking_sync', 'external_calendar'],
    default: 'manual'
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for performance
CalendarEventSchema.index({ owner: 1, startDate: 1 });
CalendarEventSchema.index({ owner: 1, endDate: 1 });
CalendarEventSchema.index({ startDate: 1, endDate: 1 });
CalendarEventSchema.index({ relatedTrip: 1, startDate: 1 });
CalendarEventSchema.index({ type: 1, status: 1 });
CalendarEventSchema.index({ 'reminders.sent': 1, 'reminders.minutes': 1 });

// Pre-save middleware
CalendarEventSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Ensure endDate is after startDate
  if (this.endDate < this.startDate) {
    this.endDate = new Date(this.startDate.getTime() + 60 * 60 * 1000); // Add 1 hour
  }
  
  next();
});

// Virtual for duration in minutes
CalendarEventSchema.virtual('durationMinutes').get(function() {
  return Math.round((this.endDate - this.startDate) / (1000 * 60));
});

// Virtual for duration display
CalendarEventSchema.virtual('durationDisplay').get(function() {
  const minutes = this.durationMinutes;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) return `${minutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
});

// Virtual for formatted date range
CalendarEventSchema.virtual('dateRange').get(function() {
  const start = this.startDate.toLocaleDateString();
  const end = this.endDate.toLocaleDateString();
  
  if (start === end) {
    return this.isAllDay 
      ? start 
      : `${start} ${this.startDate.toLocaleTimeString()} - ${this.endDate.toLocaleTimeString()}`;
  }
  
  return `${start} - ${end}`;
});

// Instance methods
CalendarEventSchema.methods.addReminder = function(type, minutes) {
  this.reminders.push({
    type: type || 'notification',
    minutes: minutes || 60
  });
  return this.save();
};

CalendarEventSchema.methods.removeReminder = function(reminderIndex) {
  if (reminderIndex >= 0 && reminderIndex < this.reminders.length) {
    this.reminders.splice(reminderIndex, 1);
    return this.save();
  }
  throw new Error('Invalid reminder index');
};

CalendarEventSchema.methods.shareWith = function(userId, permission = 'view') {
  // Check if user is already shared with
  const existingShare = this.sharedWith.find(share => 
    share.user.toString() === userId.toString());
  
  if (existingShare) {
    existingShare.permission = permission;
  } else {
    this.sharedWith.push({ user: userId, permission });
    this.isShared = true;
  }
  
  return this.save();
};

CalendarEventSchema.methods.unshareWith = function(userId) {
  this.sharedWith = this.sharedWith.filter(share => 
    share.user.toString() !== userId.toString());
  
  if (this.sharedWith.length === 0) {
    this.isShared = false;
  }
  
  return this.save();
};

CalendarEventSchema.methods.addAttendee = function(userId, role = 'attendee') {
  // Check if user is already an attendee
  const existingAttendee = this.attendees.find(attendee => 
    attendee.user.toString() === userId.toString());
  
  if (!existingAttendee) {
    this.attendees.push({ user: userId, role });
    return this.save();
  }
  
  return Promise.resolve(this);
};

CalendarEventSchema.methods.updateAttendeeStatus = function(userId, status) {
  const attendee = this.attendees.find(a => 
    a.user.toString() === userId.toString());
  
  if (attendee) {
    attendee.status = status;
    return this.save();
  }
  
  throw new Error('Attendee not found');
};

CalendarEventSchema.methods.markCompleted = function() {
  this.status = 'completed';
  return this.save();
};

CalendarEventSchema.methods.cancel = function() {
  this.status = 'cancelled';
  return this.save();
};

CalendarEventSchema.methods.clone = function(newStartDate, newEndDate) {
  const duration = this.endDate - this.startDate;
  const clonedData = {
    owner: this.owner,
    title: `${this.title} (Copy)`,
    description: this.description,
    startDate: new Date(newStartDate),
    endDate: newEndDate ? new Date(newEndDate) : new Date(newStartDate.getTime() + duration),
    isAllDay: this.isAllDay,
    timezone: this.timezone,
    type: this.type,
    category: this.category,
    location: this.location,
    address: this.address,
    priority: this.priority,
    color: this.color,
    tags: [...this.tags],
    notes: this.notes,
    reminders: this.reminders.map(r => ({ ...r.toObject(), sent: false, sentAt: null }))
  };
  
  return mongoose.model('CalendarEvent').create(clonedData);
};

// Static methods
CalendarEventSchema.statics.getEventsInDateRange = function(userId, startDate, endDate) {
  return this.find({
    owner: userId,
    $or: [
      // Events that start within the range
      { startDate: { $gte: startDate, $lte: endDate } },
      // Events that end within the range
      { endDate: { $gte: startDate, $lte: endDate } },
      // Events that span the entire range
      { startDate: { $lte: startDate }, endDate: { $gte: endDate } }
    ]
  })
  .populate('relatedTrip', 'tripName place')
  .sort({ startDate: 1 });
};

CalendarEventSchema.statics.getUpcomingEvents = function(userId, limit = 10) {
  const now = new Date();
  return this.find({
    owner: userId,
    startDate: { $gte: now },
    status: { $ne: 'cancelled' }
  })
  .populate('relatedTrip', 'tripName place')
  .sort({ startDate: 1 })
  .limit(limit);
};

CalendarEventSchema.statics.getTodayEvents = function(userId) {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));
  
  return this.getEventsInDateRange(userId, startOfDay, endOfDay);
};

CalendarEventSchema.statics.getEventsByTrip = function(userId, tripId) {
  return this.find({
    owner: userId,
    relatedTrip: tripId
  })
  .sort({ startDate: 1 });
};

CalendarEventSchema.statics.getEventsByType = function(userId, type) {
  return this.find({
    owner: userId,
    type: type
  })
  .populate('relatedTrip', 'tripName place')
  .sort({ startDate: 1 });
};

CalendarEventSchema.statics.getPendingReminders = function() {
  const now = new Date();
  
  return this.find({
    'reminders.sent': false,
    startDate: { $gt: now }
  })
  .populate('owner', 'fullName email preferences')
  .populate('relatedTrip', 'tripName place');
};

CalendarEventSchema.statics.getConflictingEvents = function(userId, startDate, endDate, excludeEventId = null) {
  const query = {
    owner: userId,
    $or: [
      { startDate: { $lt: endDate }, endDate: { $gt: startDate } }
    ]
  };
  
  if (excludeEventId) {
    query._id = { $ne: excludeEventId };
  }
  
  return this.find(query).sort({ startDate: 1 });
};

CalendarEventSchema.statics.importFromTrip = function(userId, trip) {
  const events = [];
  
  // Create main trip event
  if (trip.startDate && trip.endDate) {
    events.push({
      owner: userId,
      title: trip.tripName,
      description: trip.description,
      startDate: trip.startDate,
      endDate: trip.endDate,
      isAllDay: true,
      type: 'trip',
      category: 'travel',
      relatedTrip: trip._id,
      location: trip.place,
      color: '#10B981', // Green for trips
      source: 'trip_import'
    });
  }
  
  // Create events for transportation
  if (trip.transportation) {
    if (trip.transportation.arrival && trip.transportation.arrival.date) {
      events.push({
        owner: userId,
        title: `Arrival - ${trip.transportation.arrival.method || 'Transport'}`,
        description: trip.transportation.arrival.details,
        startDate: trip.transportation.arrival.date,
        endDate: new Date(trip.transportation.arrival.date.getTime() + 2 * 60 * 60 * 1000), // 2 hours
        type: 'flight',
        category: 'transportation',
        relatedTrip: trip._id,
        location: trip.place,
        color: '#3B82F6', // Blue for transportation
        source: 'trip_import'
      });
    }
    
    if (trip.transportation.departure && trip.transportation.departure.date) {
      events.push({
        owner: userId,
        title: `Departure - ${trip.transportation.departure.method || 'Transport'}`,
        description: trip.transportation.departure.details,
        startDate: trip.transportation.departure.date,
        endDate: new Date(trip.transportation.departure.date.getTime() + 2 * 60 * 60 * 1000), // 2 hours
        type: 'flight',
        category: 'transportation',
        relatedTrip: trip._id,
        location: trip.place,
        color: '#3B82F6',
        source: 'trip_import'
      });
    }
  }
  
  // Create events for accommodation
  if (trip.accommodation && trip.accommodation.checkIn && trip.accommodation.checkOut) {
    events.push({
      owner: userId,
      title: `${trip.accommodation.name || 'Accommodation'}`,
      description: trip.accommodation.notes,
      startDate: trip.accommodation.checkIn,
      endDate: trip.accommodation.checkOut,
      isAllDay: true,
      type: 'accommodation',
      category: 'accommodation',
      relatedTrip: trip._id,
      location: trip.accommodation.address || trip.place,
      color: '#8B5CF6', // Purple for accommodation
      source: 'trip_import'
    });
  }
  
  return this.insertMany(events);
};

// Don't include sensitive data in JSON
CalendarEventSchema.methods.toJSON = function() {
  const event = this.toObject({ virtuals: true });
  return event;
};

module.exports = mongoose.model('CalendarEvent', CalendarEventSchema);
