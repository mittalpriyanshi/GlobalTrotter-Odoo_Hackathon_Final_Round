const Itinerary = require('../models/Itinerary');
const Trip = require('../models/Trip');

// Create a new itinerary
exports.createItinerary = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      description,
      tripId,
      totalBudget,
      currency,
      startDate,
      endDate,
      tags,
      difficulty,
      travelStyle,
      isPublic,
      stops
    } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Itinerary name is required'
      });
    }

    // Verify trip ownership if tripId is provided
    if (tripId) {
      const trip = await Trip.findOne({ _id: tripId, owner: userId });
      if (!trip) {
        return res.status(404).json({
          success: false,
          message: 'Trip not found or access denied'
        });
      }
    }

    // Create itinerary
    const itinerary = await Itinerary.create({
      name,
      description,
      owner: userId,
      tripId,
      totalBudget: totalBudget || 0,
      currency: currency || 'USD',
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      tags: Array.isArray(tags) ? tags : [],
      difficulty,
      travelStyle,
      isPublic: isPublic || false,
      stops: stops || []
    });

    // Populate owner info
    await itinerary.populate('owner', 'fullName profilePic location');

    res.status(201).json({
      success: true,
      message: 'Itinerary created successfully',
      itinerary
    });
  } catch (err) {
    console.error('Create itinerary error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error creating itinerary'
    });
  }
};

// Get user's itineraries
exports.getUserItineraries = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      tripId, 
      status, 
      isPublic, 
      limit = 20, 
      page = 1, 
      sortBy = 'updatedAt', 
      sortOrder = 'desc' 
    } = req.query;

    // Build query
    const query = { owner: userId };
    
    if (tripId) query.tripId = tripId;
    if (status) query.status = status;
    if (isPublic !== undefined) query.isPublic = isPublic === 'true';

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const itineraries = await Itinerary.find(query)
      .populate('owner', 'fullName profilePic location')
      .populate('tripId', 'tripName place')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalCount = await Itinerary.countDocuments(query);

    res.json({
      success: true,
      itineraries,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (err) {
    console.error('Get user itineraries error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching itineraries'
    });
  }
};

// Get itinerary by ID
exports.getItineraryById = async (req, res) => {
  try {
    const { itineraryId } = req.params;
    const userId = req.user.id;

    const itinerary = await Itinerary.findById(itineraryId)
      .populate('owner', 'fullName profilePic location')
      .populate('tripId', 'tripName place')
      .populate('collaborators.user', 'fullName profilePic');

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }

    // Check access permissions
    const hasAccess = 
      itinerary.owner._id.toString() === userId ||
      itinerary.isPublic ||
      itinerary.collaborators.some(collab => collab.user._id.toString() === userId);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this itinerary'
      });
    }

    // Increment view count if not owner
    if (itinerary.owner._id.toString() !== userId) {
      await itinerary.incrementView();
    }

    res.json({
      success: true,
      itinerary
    });
  } catch (err) {
    console.error('Get itinerary error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching itinerary'
    });
  }
};

// Update itinerary
exports.updateItinerary = async (req, res) => {
  try {
    const { itineraryId } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Find and verify ownership or edit permissions
    const itinerary = await Itinerary.findById(itineraryId);
    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }

    const hasEditAccess = 
      itinerary.owner.toString() === userId ||
      itinerary.collaborators.some(collab => 
        collab.user.toString() === userId && 
        ['editor', 'admin'].includes(collab.role)
      );

    if (!hasEditAccess) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied to edit this itinerary'
      });
    }

    // Update fields (exclude sensitive fields for non-owners)
    const allowedFields = ['name', 'description', 'totalBudget', 'currency', 'startDate', 'endDate', 'tags', 'difficulty', 'travelStyle', 'stops', 'status'];
    const filteredData = {};
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    // Only owner can change publicity and collaboration settings
    if (itinerary.owner.toString() === userId) {
      if (updateData.isPublic !== undefined) filteredData.isPublic = updateData.isPublic;
      if (updateData.collaborators !== undefined) filteredData.collaborators = updateData.collaborators;
    }

    // Parse dates
    if (filteredData.startDate) filteredData.startDate = new Date(filteredData.startDate);
    if (filteredData.endDate) filteredData.endDate = new Date(filteredData.endDate);

    // Update itinerary
    Object.assign(itinerary, filteredData);
    await itinerary.save();

    // Populate and return
    await itinerary.populate('owner', 'fullName profilePic location');
    await itinerary.populate('tripId', 'tripName place');

    res.json({
      success: true,
      message: 'Itinerary updated successfully',
      itinerary
    });
  } catch (err) {
    console.error('Update itinerary error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error updating itinerary'
    });
  }
};

// Delete itinerary
exports.deleteItinerary = async (req, res) => {
  try {
    const { itineraryId } = req.params;
    const userId = req.user.id;

    const itinerary = await Itinerary.findOneAndDelete({ 
      _id: itineraryId, 
      owner: userId 
    });

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found or access denied'
      });
    }

    res.json({
      success: true,
      message: 'Itinerary deleted successfully'
    });
  } catch (err) {
    console.error('Delete itinerary error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error deleting itinerary'
    });
  }
};

// Clone itinerary
exports.cloneItinerary = async (req, res) => {
  try {
    const { itineraryId } = req.params;
    const userId = req.user.id;
    const { name } = req.body;

    const itinerary = await Itinerary.findById(itineraryId);
    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }

    // Check access permissions
    const hasAccess = 
      itinerary.owner.toString() === userId ||
      itinerary.isPublic ||
      itinerary.collaborators.some(collab => collab.user.toString() === userId);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to clone this itinerary'
      });
    }

    const clonedItinerary = await itinerary.cloneItinerary(userId, name);
    await clonedItinerary.populate('owner', 'fullName profilePic location');

    res.status(201).json({
      success: true,
      message: 'Itinerary cloned successfully',
      itinerary: clonedItinerary
    });
  } catch (err) {
    console.error('Clone itinerary error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error cloning itinerary'
    });
  }
};

// Add stop to itinerary
exports.addStop = async (req, res) => {
  try {
    const { itineraryId } = req.params;
    const userId = req.user.id;
    const stopData = req.body;

    const itinerary = await Itinerary.findById(itineraryId);
    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }

    // Check edit permissions
    const hasEditAccess = 
      itinerary.owner.toString() === userId ||
      itinerary.collaborators.some(collab => 
        collab.user.toString() === userId && 
        ['editor', 'admin'].includes(collab.role)
      );

    if (!hasEditAccess) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied to edit this itinerary'
      });
    }

    await itinerary.addStop(stopData);
    await itinerary.populate('owner', 'fullName profilePic location');

    res.json({
      success: true,
      message: 'Stop added successfully',
      itinerary
    });
  } catch (err) {
    console.error('Add stop error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error adding stop'
    });
  }
};

// Update stop
exports.updateStop = async (req, res) => {
  try {
    const { itineraryId, stopId } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    const itinerary = await Itinerary.findById(itineraryId);
    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }

    // Check edit permissions
    const hasEditAccess = 
      itinerary.owner.toString() === userId ||
      itinerary.collaborators.some(collab => 
        collab.user.toString() === userId && 
        ['editor', 'admin'].includes(collab.role)
      );

    if (!hasEditAccess) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied to edit this itinerary'
      });
    }

    const stop = itinerary.stops.find(s => s.id === stopId);
    if (!stop) {
      return res.status(404).json({
        success: false,
        message: 'Stop not found'
      });
    }

    // Update stop
    Object.assign(stop, updateData, { updatedAt: new Date() });
    await itinerary.save();
    await itinerary.populate('owner', 'fullName profilePic location');

    res.json({
      success: true,
      message: 'Stop updated successfully',
      itinerary
    });
  } catch (err) {
    console.error('Update stop error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error updating stop'
    });
  }
};

// Remove stop
exports.removeStop = async (req, res) => {
  try {
    const { itineraryId, stopId } = req.params;
    const userId = req.user.id;

    const itinerary = await Itinerary.findById(itineraryId);
    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }

    // Check edit permissions
    const hasEditAccess = 
      itinerary.owner.toString() === userId ||
      itinerary.collaborators.some(collab => 
        collab.user.toString() === userId && 
        ['editor', 'admin'].includes(collab.role)
      );

    if (!hasEditAccess) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied to edit this itinerary'
      });
    }

    await itinerary.removeStop(stopId);
    await itinerary.populate('owner', 'fullName profilePic location');

    res.json({
      success: true,
      message: 'Stop removed successfully',
      itinerary
    });
  } catch (err) {
    console.error('Remove stop error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error removing stop'
    });
  }
};

// Move stop
exports.moveStop = async (req, res) => {
  try {
    const { itineraryId } = req.params;
    const { fromIndex, toIndex } = req.body;
    const userId = req.user.id;

    const itinerary = await Itinerary.findById(itineraryId);
    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }

    // Check edit permissions
    const hasEditAccess = 
      itinerary.owner.toString() === userId ||
      itinerary.collaborators.some(collab => 
        collab.user.toString() === userId && 
        ['editor', 'admin'].includes(collab.role)
      );

    if (!hasEditAccess) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied to edit this itinerary'
      });
    }

    await itinerary.moveStop(fromIndex, toIndex);
    await itinerary.populate('owner', 'fullName profilePic location');

    res.json({
      success: true,
      message: 'Stop moved successfully',
      itinerary
    });
  } catch (err) {
    console.error('Move stop error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error moving stop'
    });
  }
};

// Add activity to stop
exports.addActivity = async (req, res) => {
  try {
    const { itineraryId, stopId } = req.params;
    const userId = req.user.id;
    const activityData = req.body;

    const itinerary = await Itinerary.findById(itineraryId);
    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }

    // Check edit permissions
    const hasEditAccess = 
      itinerary.owner.toString() === userId ||
      itinerary.collaborators.some(collab => 
        collab.user.toString() === userId && 
        ['editor', 'admin'].includes(collab.role)
      );

    if (!hasEditAccess) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied to edit this itinerary'
      });
    }

    await itinerary.addActivity(stopId, activityData);
    await itinerary.populate('owner', 'fullName profilePic location');

    res.json({
      success: true,
      message: 'Activity added successfully',
      itinerary
    });
  } catch (err) {
    console.error('Add activity error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error adding activity'
    });
  }
};

// Update activity
exports.updateActivity = async (req, res) => {
  try {
    const { itineraryId, stopId, activityId } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    const itinerary = await Itinerary.findById(itineraryId);
    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }

    // Check edit permissions
    const hasEditAccess = 
      itinerary.owner.toString() === userId ||
      itinerary.collaborators.some(collab => 
        collab.user.toString() === userId && 
        ['editor', 'admin'].includes(collab.role)
      );

    if (!hasEditAccess) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied to edit this itinerary'
      });
    }

    await itinerary.updateActivity(stopId, activityId, updateData);
    await itinerary.populate('owner', 'fullName profilePic location');

    res.json({
      success: true,
      message: 'Activity updated successfully',
      itinerary
    });
  } catch (err) {
    console.error('Update activity error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error updating activity'
    });
  }
};

// Remove activity
exports.removeActivity = async (req, res) => {
  try {
    const { itineraryId, stopId, activityId } = req.params;
    const userId = req.user.id;

    const itinerary = await Itinerary.findById(itineraryId);
    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }

    // Check edit permissions
    const hasEditAccess = 
      itinerary.owner.toString() === userId ||
      itinerary.collaborators.some(collab => 
        collab.user.toString() === userId && 
        ['editor', 'admin'].includes(collab.role)
      );

    if (!hasEditAccess) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied to edit this itinerary'
      });
    }

    await itinerary.removeActivity(stopId, activityId);
    await itinerary.populate('owner', 'fullName profilePic location');

    res.json({
      success: true,
      message: 'Activity removed successfully',
      itinerary
    });
  } catch (err) {
    console.error('Remove activity error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error removing activity'
    });
  }
};

// Get public itineraries
exports.getPublicItineraries = async (req, res) => {
  try {
    const { 
      q, // search query
      tags, 
      difficulty, 
      travelStyle, 
      city,
      limit = 20, 
      page = 1,
      sortBy = 'likes' // likes, views, createdAt
    } = req.query;

    let itineraries;

    if (city) {
      itineraries = await Itinerary.getItinerariesByCity(city, true);
    } else if (q || tags || difficulty || travelStyle) {
      const filters = {};
      if (tags) filters.tags = Array.isArray(tags) ? tags : [tags];
      if (difficulty) filters.difficulty = difficulty;
      if (travelStyle) filters.travelStyle = travelStyle;
      
      itineraries = await Itinerary.searchPublicItineraries(q, filters);
    } else {
      itineraries = await Itinerary.getPopularItineraries(parseInt(limit));
    }

    // Apply pagination if not already applied
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedItineraries = itineraries.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      itineraries: paginatedItineraries,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(itineraries.length / parseInt(limit)),
        totalItems: itineraries.length,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (err) {
    console.error('Get public itineraries error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching public itineraries'
    });
  }
};

// Like/Unlike itinerary
exports.toggleLike = async (req, res) => {
  try {
    const { itineraryId } = req.params;
    const userId = req.user.id;

    const itinerary = await Itinerary.findById(itineraryId);
    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }

    const isLiked = itinerary.likedBy.includes(userId);
    
    if (isLiked) {
      await itinerary.removeLike(userId);
    } else {
      await itinerary.addLike(userId);
    }

    res.json({
      success: true,
      message: isLiked ? 'Like removed' : 'Like added',
      isLiked: !isLiked,
      likes: itinerary.likes
    });
  } catch (err) {
    console.error('Toggle like error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error toggling like'
    });
  }
};

// Bookmark/Unbookmark itinerary
exports.toggleBookmark = async (req, res) => {
  try {
    const { itineraryId } = req.params;
    const userId = req.user.id;

    const itinerary = await Itinerary.findById(itineraryId);
    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }

    const isBookmarked = itinerary.bookmarkedBy.includes(userId);
    
    if (isBookmarked) {
      await itinerary.removeBookmark(userId);
    } else {
      await itinerary.addBookmark(userId);
    }

    res.json({
      success: true,
      message: isBookmarked ? 'Bookmark removed' : 'Bookmark added',
      isBookmarked: !isBookmarked,
      bookmarks: itinerary.bookmarks
    });
  } catch (err) {
    console.error('Toggle bookmark error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error toggling bookmark'
    });
  }
};
