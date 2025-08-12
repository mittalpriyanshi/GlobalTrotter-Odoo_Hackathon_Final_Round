const CalendarEvent = require('../models/CalendarEvent');
const Trip = require('../models/Trip');

// Create new calendar event
exports.createEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      title,
      description,
      startDate,
      endDate,
      isAllDay,
      timezone,
      type,
      category,
      location,
      address,
      priority,
      color,
      relatedTripId,
      bookingInfo,
      reminders,
      tags,
      notes
    } = req.body;

    // Validation
    if (!title || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Title, start date, and end date are required'
      });
    }

    // Verify trip ownership if relatedTripId is provided
    if (relatedTripId) {
      const trip = await Trip.findOne({ _id: relatedTripId, owner: userId });
      if (!trip) {
        return res.status(404).json({
          success: false,
          message: 'Trip not found or access denied'
        });
      }
    }

    // Create calendar event
    const event = await CalendarEvent.create({
      owner: userId,
      title,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isAllDay: isAllDay || false,
      timezone: timezone || 'UTC',
      type: type || 'other',
      category: category || 'personal',
      location,
      address,
      priority: priority || 'medium',
      color: color || '#3B82F6',
      relatedTrip: relatedTripId || null,
      bookingInfo: bookingInfo || {},
      reminders: Array.isArray(reminders) ? reminders : [],
      tags: Array.isArray(tags) ? tags : [],
      notes
    });

    // Populate related data
    await event.populate('relatedTrip', 'tripName place');

    res.status(201).json({
      success: true,
      message: 'Calendar event created successfully',
      event
    });
  } catch (err) {
    console.error('Create calendar event error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error creating calendar event'
    });
  }
};

// Get user's calendar events
exports.getEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      startDate,
      endDate,
      type,
      category,
      tripId,
      status,
      limit = 100,
      page = 1,
      sortBy = 'startDate',
      sortOrder = 'asc'
    } = req.query;

    let query = { owner: userId };

    // Date range filtering
    if (startDate && endDate) {
      const events = await CalendarEvent.getEventsInDateRange(
        userId, 
        new Date(startDate), 
        new Date(endDate)
      );
      
      return res.json({
        success: true,
        events,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: events.length,
          itemsPerPage: events.length
        }
      });
    }

    // Other filters
    if (type) query.type = type;
    if (category) query.category = category;
    if (tripId) query.relatedTrip = tripId;
    if (status) query.status = status;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const events = await CalendarEvent.find(query)
      .populate('relatedTrip', 'tripName place')
      .populate('sharedWith.user', 'fullName profilePic')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await CalendarEvent.countDocuments(query);

    res.json({
      success: true,
      events,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (err) {
    console.error('Get calendar events error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching calendar events'
    });
  }
};

// Get event by ID
exports.getEventById = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    const event = await CalendarEvent.findById(eventId)
      .populate('relatedTrip', 'tripName place')
      .populate('sharedWith.user', 'fullName profilePic')
      .populate('attendees.user', 'fullName profilePic email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Calendar event not found'
      });
    }

    // Check access permissions
    const hasAccess = 
      event.owner.toString() === userId ||
      event.sharedWith.some(share => share.user._id.toString() === userId) ||
      event.attendees.some(attendee => attendee.user._id.toString() === userId);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this calendar event'
      });
    }

    res.json({
      success: true,
      event
    });
  } catch (err) {
    console.error('Get calendar event error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching calendar event'
    });
  }
};

// Update calendar event
exports.updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Find and verify ownership or edit permissions
    const event = await CalendarEvent.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Calendar event not found'
      });
    }

    const hasEditAccess = 
      event.owner.toString() === userId ||
      event.sharedWith.some(share => 
        share.user.toString() === userId && share.permission === 'edit'
      );

    if (!hasEditAccess) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied to edit this calendar event'
      });
    }

    // Update fields
    const allowedFields = [
      'title', 'description', 'startDate', 'endDate', 'isAllDay', 'timezone',
      'type', 'category', 'location', 'address', 'priority', 'color', 'status',
      'bookingInfo', 'reminders', 'tags', 'notes'
    ];

    const filteredData = {};
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    // Only owner can change sharing settings
    if (event.owner.toString() === userId) {
      if (updateData.sharedWith !== undefined) filteredData.sharedWith = updateData.sharedWith;
      if (updateData.attendees !== undefined) filteredData.attendees = updateData.attendees;
    }

    // Parse dates
    if (filteredData.startDate) filteredData.startDate = new Date(filteredData.startDate);
    if (filteredData.endDate) filteredData.endDate = new Date(filteredData.endDate);

    // Update event
    Object.assign(event, filteredData);
    await event.save();

    // Populate and return
    await event.populate('relatedTrip', 'tripName place');

    res.json({
      success: true,
      message: 'Calendar event updated successfully',
      event
    });
  } catch (err) {
    console.error('Update calendar event error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error updating calendar event'
    });
  }
};

// Delete calendar event
exports.deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    const event = await CalendarEvent.findOneAndDelete({
      _id: eventId,
      owner: userId
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Calendar event not found or access denied'
      });
    }

    res.json({
      success: true,
      message: 'Calendar event deleted successfully'
    });
  } catch (err) {
    console.error('Delete calendar event error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error deleting calendar event'
    });
  }
};

// Get today's events
exports.getTodayEvents = async (req, res) => {
  try {
    const userId = req.user.id;

    const events = await CalendarEvent.getTodayEvents(userId);

    res.json({
      success: true,
      events
    });
  } catch (err) {
    console.error('Get today events error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching today\'s events'
    });
  }
};

// Get upcoming events
exports.getUpcomingEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    const events = await CalendarEvent.getUpcomingEvents(userId, parseInt(limit));

    res.json({
      success: true,
      events
    });
  } catch (err) {
    console.error('Get upcoming events error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching upcoming events'
    });
  }
};

// Get events by trip
exports.getEventsByTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user.id;

    // Verify trip access
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    const hasAccess = 
      trip.owner.toString() === userId ||
      trip.isPublic ||
      trip.sharedWith.some(share => share.user.toString() === userId);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this trip'
      });
    }

    const events = await CalendarEvent.getEventsByTrip(userId, tripId);

    res.json({
      success: true,
      events
    });
  } catch (err) {
    console.error('Get events by trip error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching trip events'
    });
  }
};

// Clone event
exports.cloneEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;
    const { startDate, endDate } = req.body;

    const originalEvent = await CalendarEvent.findById(eventId);
    if (!originalEvent) {
      return res.status(404).json({
        success: false,
        message: 'Calendar event not found'
      });
    }

    // Check access permissions
    const hasAccess = 
      originalEvent.owner.toString() === userId ||
      originalEvent.sharedWith.some(share => share.user.toString() === userId);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to clone this event'
      });
    }

    if (!startDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date is required for cloning'
      });
    }

    const clonedEvent = await originalEvent.clone(new Date(startDate), endDate ? new Date(endDate) : null);
    await clonedEvent.populate('relatedTrip', 'tripName place');

    res.status(201).json({
      success: true,
      message: 'Calendar event cloned successfully',
      event: clonedEvent
    });
  } catch (err) {
    console.error('Clone calendar event error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error cloning calendar event'
    });
  }
};

// Share event with user
exports.shareEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;
    const { userEmail, permission = 'view' } = req.body;

    const event = await CalendarEvent.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Calendar event not found'
      });
    }

    // Only owner can share
    if (event.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only event owner can share the event'
      });
    }

    // Find user by email
    const User = require('../models/User');
    const userToShare = await User.findOne({ email: userEmail.toLowerCase() });
    if (!userToShare) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await event.shareWith(userToShare._id, permission);
    await event.populate('sharedWith.user', 'fullName profilePic email');

    res.json({
      success: true,
      message: 'Calendar event shared successfully',
      event
    });
  } catch (err) {
    console.error('Share calendar event error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error sharing calendar event'
    });
  }
};

// Import events from trip
exports.importFromTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user.id;

    const trip = await Trip.findOne({ _id: tripId, owner: userId });
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found or access denied'
      });
    }

    // Check if events already exist for this trip
    const existingEvents = await CalendarEvent.find({
      owner: userId,
      relatedTrip: tripId,
      source: 'trip_import'
    });

    if (existingEvents.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Events have already been imported for this trip'
      });
    }

    const importedEvents = await CalendarEvent.importFromTrip(userId, trip);

    res.status(201).json({
      success: true,
      message: `${importedEvents.length} events imported successfully`,
      events: importedEvents
    });
  } catch (err) {
    console.error('Import from trip error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error importing events from trip'
    });
  }
};

// Get calendar statistics
exports.getCalendarStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await CalendarEvent.aggregate([
      { $match: { owner: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          upcomingCount: {
            $sum: { 
              $cond: [
                { $gte: ['$startDate', new Date()] },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          type: '$_id',
          count: 1,
          upcomingCount: 1
        }
      }
    ]);

    const totalEvents = await CalendarEvent.countDocuments({ owner: userId });
    const upcomingEvents = await CalendarEvent.countDocuments({
      owner: userId,
      startDate: { $gte: new Date() }
    });

    res.json({
      success: true,
      statistics: {
        total: totalEvents,
        upcoming: upcomingEvents,
        byType: stats
      }
    });
  } catch (err) {
    console.error('Get calendar stats error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching calendar statistics'
    });
  }
};

// Check for conflicting events
exports.checkConflicts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, excludeEventId } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start date and end date are required'
      });
    }

    const conflicts = await CalendarEvent.getConflictingEvents(
      userId,
      new Date(startDate),
      new Date(endDate),
      excludeEventId
    );

    res.json({
      success: true,
      conflicts,
      hasConflicts: conflicts.length > 0
    });
  } catch (err) {
    console.error('Check conflicts error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error checking for conflicts'
    });
  }
};
