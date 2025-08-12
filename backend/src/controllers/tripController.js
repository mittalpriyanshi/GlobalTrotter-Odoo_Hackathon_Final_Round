const Trip = require('../models/Trip');
const Itinerary = require('../models/Itinerary');
const Expense = require('../models/Expense');

// Create new trip
exports.createTrip = async (req, res) => {
  try {
    console.log('Auth user object:', req.user);
    console.log('User ID extraction:', {
      '_id': req.user?._id,
      'id': req.user?.id,
      'user_type': typeof req.user
    });
    
    const userId = req.user._id || req.user.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User ID not found. Please log in again.'
      });
    }
    const {
      tripName,
      place,
      description,
      startDate,
      endDate,
      budget,
      currency,
      travelers,
      travelStyle,
      suggestions,
      transportation,
      accommodation,
      tags,
      notes
    } = req.body;

    // Validation
    if (!tripName || !place) {
      return res.status(400).json({
        success: false,
        message: 'Trip name and destination are required'
      });
    }
    
    // Validate tripName and place are strings
    if (typeof tripName !== 'string' || typeof place !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Trip name and place must be text values'
      });
    }
    
    // Validate budget is a number if provided
    if (budget !== undefined && budget !== null && isNaN(Number(budget))) {
      return res.status(400).json({
        success: false,
        message: 'Budget must be a valid number'
      });
    }
    
    // Validate travelers is a number if provided
    if (travelers !== undefined && travelers !== null && isNaN(Number(travelers))) {
      return res.status(400).json({
        success: false,
        message: 'Number of travelers must be a valid number'
      });
    }

    // Safely handle date conversion
    let startDateObj = null;
    let endDateObj = null;
    
    if (startDate) {
      try {
        startDateObj = new Date(startDate);
        if (isNaN(startDateObj.getTime())) startDateObj = null;
      } catch (e) {
        console.warn('Invalid start date:', startDate);
      }
    }
    
    if (endDate) {
      try {
        endDateObj = new Date(endDate);
        if (isNaN(endDateObj.getTime())) endDateObj = null;
      } catch (e) {
        console.warn('Invalid end date:', endDate);
      }
    }

    console.log('Creating trip with data:', {
      owner: userId,
      tripName,
      place,
      startDate: startDateObj,
      endDate: endDateObj,
      budget,
      currency,
      travelers,
      travelStyle,
      suggestions: suggestions ? suggestions.length : 0,
      suggestionsPreview: suggestions ? suggestions.slice(0, 2) : []
    });

    const trip = await Trip.create({
      owner: userId,
      tripName: tripName.trim(),
      place: place.trim(),
      description: description || '',
      startDate: startDateObj,
      endDate: endDateObj,
      budget: Number(budget) || 0,
      currency: currency || 'USD',
      travelers: Number(travelers) || 1,
      travelStyle: travelStyle || 'solo',
      suggestions: Array.isArray(suggestions) ? suggestions : [],
      transportation: transportation || {},
      accommodation: accommodation || {},
      tags: Array.isArray(tags) ? tags : [],
      notes: notes || ''
    });

    await trip.populate('owner', 'fullName profilePic location');

    res.status(201).json({ 
      success: true,
      message: 'Trip created successfully',
      trip 
    });
  } catch (err) {
    console.error('Create trip error:', err);
    console.error('Error details:', {
      name: err.name,
      message: err.message,
      code: err.code,
      stack: err.stack
    });
    
    // Handle specific MongoDB errors
    if (err.name === 'ValidationError') {
      console.error('Mongoose validation error details:', err.errors);
      const errors = Object.values(err.errors).map(e => ({
        field: e.path,
        message: e.message,
        value: e.value
      }));
      console.error('Processed validation errors:', errors);
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.map(e => `${e.field}: ${e.message}`)
      });
    }
    
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate key error'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error creating trip',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Get user's trips with filtering and pagination
exports.getUserTrips = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const {
      status,
      search,
      startDate,
      endDate,
      limit = 20,
      page = 1,
      sortBy = 'updatedAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { owner: userId };

    if (status && status !== 'all') {
      if (status === 'upcoming') {
        query.startDate = { $gte: new Date() };
        query.status = { $in: ['planning', 'confirmed'] };
      } else if (status === 'ongoing') {
        const now = new Date();
        query.startDate = { $lte: now };
        query.endDate = { $gte: now };
      } else if (status === 'completed') {
        query.endDate = { $lt: new Date() };
      } else {
        query.status = status;
      }
    }

    if (search) {
      query.$text = { $search: search };
    }

    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = new Date(startDate);
      if (endDate) query.startDate.$lte = new Date(endDate);
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const trips = await Trip.find(query)
      .populate('owner', 'fullName profilePic location')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalCount = await Trip.countDocuments(query);

    res.json({
      success: true,
      trips,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (err) {
    console.error('Get user trips error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching trips'
    });
  }
};

// Get trip by ID
exports.getTripById = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user._id || req.user.id;

    const trip = await Trip.findById(tripId)
      .populate('owner', 'fullName profilePic location')
      .populate('sharedWith.user', 'fullName profilePic')
      .populate('itineraries')
      .populate('expenses')
      .populate('journalEntries');

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check access permissions
    const hasAccess =
      trip.owner._id.toString() === userId ||
      trip.isPublic ||
      trip.sharedWith.some(share => share.user._id.toString() === userId);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this trip'
      });
    }

    // Increment view count if not owner
    if (trip.owner._id.toString() !== userId) {
      await trip.incrementView();
    }

    res.json({
      success: true,
      trip
    });
  } catch (err) {
    console.error('Get trip error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching trip'
    });
  }
};

// Update trip
exports.updateTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user._id || req.user.id;
    const updateData = req.body;

    // Find and verify ownership or edit permissions
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    const hasEditAccess =
      trip.owner.toString() === userId ||
      trip.sharedWith.some(share =>
        share.user.toString() === userId && share.role === 'editor'
      );

    if (!hasEditAccess) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied to edit this trip'
      });
    }

    // Update fields
    const allowedFields = [
      'tripName', 'place', 'description', 'startDate', 'endDate',
      'budget', 'currency', 'travelers', 'travelStyle', 'suggestions',
      'transportation', 'accommodation', 'tags', 'notes', 'status'
    ];

    const filteredData = {};
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    // Only owner can change sharing settings
    if (trip.owner.toString() === userId) {
      if (updateData.isPublic !== undefined) filteredData.isPublic = updateData.isPublic;
      if (updateData.sharedWith !== undefined) filteredData.sharedWith = updateData.sharedWith;
    }

    // Parse dates
    if (filteredData.startDate) filteredData.startDate = new Date(filteredData.startDate);
    if (filteredData.endDate) filteredData.endDate = new Date(filteredData.endDate);

    // Update trip
    Object.assign(trip, filteredData);
    await trip.save();

    // Populate and return
    await trip.populate('owner', 'fullName profilePic location');

    res.json({ 
      success: true,
      message: 'Trip updated successfully',
      trip 
    });
  } catch (err) {
    console.error('Update trip error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error updating trip'
    });
  }
};

// Delete trip
exports.deleteTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user._id || req.user.id;

    const trip = await Trip.findOneAndDelete({
      _id: tripId,
      owner: userId
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found or access denied'
      });
    }

    // Also delete related data
    await Itinerary.deleteMany({ tripId: tripId });
    await Expense.deleteMany({ trip: tripId });

    res.json({
      success: true,
      message: 'Trip deleted successfully'
    });
  } catch (err) {
    console.error('Delete trip error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error deleting trip'
    });
  }
};

// Clone trip
exports.cloneTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user._id || req.user.id;
    const { tripName } = req.body;

    const originalTrip = await Trip.findById(tripId);
    if (!originalTrip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check access permissions
    const hasAccess =
      originalTrip.owner.toString() === userId ||
      originalTrip.isPublic ||
      originalTrip.sharedWith.some(share => share.user.toString() === userId);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to clone this trip'
      });
    }

    const clonedTrip = await originalTrip.clone(userId, tripName);
    await clonedTrip.populate('owner', 'fullName profilePic location');

    res.status(201).json({
      success: true,
      message: 'Trip cloned successfully',
      trip: clonedTrip
    });
  } catch (err) {
    console.error('Clone trip error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error cloning trip'
    });
  }
};

// Add suggestion to trip
exports.addSuggestion = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user._id || req.user.id;
    const suggestionData = req.body;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check edit permissions
    const hasEditAccess =
      trip.owner.toString() === userId ||
      trip.sharedWith.some(share =>
        share.user.toString() === userId && share.role === 'editor'
      );

    if (!hasEditAccess) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied to edit this trip'
      });
    }

    await trip.addSuggestion(suggestionData);
    await trip.populate('owner', 'fullName profilePic location');

    res.json({
      success: true,
      message: 'Suggestion added successfully',
      trip
    });
  } catch (err) {
    console.error('Add suggestion error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error adding suggestion'
    });
  }
};

// Update suggestion
exports.updateSuggestion = async (req, res) => {
  try {
    const { tripId, suggestionId } = req.params;
    const userId = req.user._id || req.user.id;
    const updateData = req.body;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check edit permissions
    const hasEditAccess =
      trip.owner.toString() === userId ||
      trip.sharedWith.some(share =>
        share.user.toString() === userId && share.role === 'editor'
      );

    if (!hasEditAccess) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied to edit this trip'
      });
    }

    await trip.updateSuggestion(suggestionId, updateData);
    await trip.populate('owner', 'fullName profilePic location');

    res.json({
      success: true,
      message: 'Suggestion updated successfully',
      trip
    });
  } catch (err) {
    console.error('Update suggestion error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error updating suggestion'
    });
  }
};

// Remove suggestion
exports.removeSuggestion = async (req, res) => {
  try {
    const { tripId, suggestionId } = req.params;
    const userId = req.user._id || req.user.id;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Check edit permissions
    const hasEditAccess =
      trip.owner.toString() === userId ||
      trip.sharedWith.some(share =>
        share.user.toString() === userId && share.role === 'editor'
      );

    if (!hasEditAccess) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied to edit this trip'
      });
    }

    await trip.removeSuggestion(suggestionId);
    await trip.populate('owner', 'fullName profilePic location');

    res.json({
      success: true,
      message: 'Suggestion removed successfully',
      trip
    });
  } catch (err) {
    console.error('Remove suggestion error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error removing suggestion'
    });
  }
};

// Share trip with user
exports.shareTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { userEmail, role = 'viewer' } = req.body;
    const userId = req.user._id || req.user.id;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Only owner can share
    if (trip.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only trip owner can share the trip'
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

    await trip.shareWith(userToShare._id, role);
    await trip.populate('sharedWith.user', 'fullName profilePic email');

    res.json({
      success: true,
      message: 'Trip shared successfully',
      trip
    });
  } catch (err) {
    console.error('Share trip error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error sharing trip'
    });
  }
};

// Unshare trip
exports.unshareTrip = async (req, res) => {
  try {
    const { tripId, userId: targetUserId } = req.params;
    const userId = req.user._id || req.user.id;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Only owner can unshare
    if (trip.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only trip owner can unshare the trip'
      });
    }

    await trip.unshareWith(targetUserId);
    await trip.populate('sharedWith.user', 'fullName profilePic email');

    res.json({
      success: true,
      message: 'Trip unshared successfully',
      trip
    });
  } catch (err) {
    console.error('Unshare trip error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error unsharing trip'
    });
  }
};

// Get trip statistics
exports.getTripStatistics = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const stats = await Trip.getTripStatistics(userId);
    const upcomingTrips = await Trip.getUpcomingTrips(userId, 5);
    const recentTrips = await Trip.getRecentTrips(userId, 5);

    const totalTrips = await Trip.countDocuments({ owner: userId });
    const completedTrips = await Trip.countDocuments({
      owner: userId,
      status: 'completed'
    });

    res.json({
      success: true,
      statistics: {
        totalTrips,
        completedTrips,
        completionRate: totalTrips > 0 ? Math.round((completedTrips / totalTrips) * 100) : 0,
        statusBreakdown: stats,
        upcomingTrips,
        recentTrips
      }
    });
  } catch (err) {
    console.error('Get trip statistics error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching statistics'
    });
  }
};

// Get public trips
exports.getPublicTrips = async (req, res) => {
  try {
    const {
      search,
      place,
      travelStyle,
      budget,
      duration,
      limit = 20,
      page = 1,
      sortBy = 'likes'
    } = req.query;

    const query = { isPublic: true };

    if (search) {
      query.$text = { $search: search };
    }

    if (place) {
      query.place = new RegExp(place, 'i');
    }

    if (travelStyle) {
      query.travelStyle = travelStyle;
    }

    if (budget) {
      const budgetRange = parseInt(budget);
      query.budget = { $lte: budgetRange };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortBy === 'likes' ? -1 : -1;

    const trips = await Trip.find(query)
      .populate('owner', 'fullName profilePic location')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Trip.countDocuments(query);

    res.json({
      success: true,
      trips,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (err) {
    console.error('Get public trips error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching public trips'
    });
  }
};
