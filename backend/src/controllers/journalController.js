const JournalEntry = require('../models/JournalEntry');
const Trip = require('../models/Trip');

// Create new journal entry
exports.createJournalEntry = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      title,
      content,
      tripId,
      date,
      location,
      mood,
      weather,
      highlights,
      photos,
      tags,
      isPublic,
      isPinned
    } = req.body;

    // Validation
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
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

    // Create journal entry
    const journalEntry = await JournalEntry.create({
      owner: userId,
      trip: tripId || null,
      title,
      content,
      date: date ? new Date(date) : null,
      location,
      mood,
      weather,
      highlights: Array.isArray(highlights) ? highlights : [],
      photos: Array.isArray(photos) ? photos : [],
      tags: Array.isArray(tags) ? tags : [],
      isPublic: isPublic || false,
      isPinned: isPinned || false
    });

    // Populate owner and trip info
    await journalEntry.populate('owner', 'fullName profilePic location');
    await journalEntry.populate('trip', 'tripName place');

    // Add entry reference to trip if associated
    if (tripId) {
      await Trip.findByIdAndUpdate(tripId, {
        $push: { journalEntries: journalEntry._id }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Journal entry created successfully',
      entry: journalEntry
    });
  } catch (err) {
    console.error('Create journal entry error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error creating journal entry'
    });
  }
};

// Get user's journal entries
exports.getUserJournalEntries = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      tripId,
      mood,
      startDate,
      endDate,
      search,
      tags,
      limit = 20,
      page = 1,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { owner: userId };

    if (tripId) query.trip = tripId;
    if (mood) query.mood = mood;
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const entries = await JournalEntry.find(query)
      .populate('owner', 'fullName profilePic location')
      .populate('trip', 'tripName place')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalCount = await JournalEntry.countDocuments(query);

    res.json({
      success: true,
      entries,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (err) {
    console.error('Get user journal entries error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching journal entries'
    });
  }
};

// Get journal entry by ID
exports.getJournalEntryById = async (req, res) => {
  try {
    const { entryId } = req.params;
    const userId = req.user.id;

    const entry = await JournalEntry.findById(entryId)
      .populate('owner', 'fullName profilePic location')
      .populate('trip', 'tripName place')
      .populate('comments.user', 'fullName profilePic');

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    // Check access permissions
    const hasAccess = 
      entry.owner._id.toString() === userId ||
      entry.isPublic;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this journal entry'
      });
    }

    // Increment view count if not owner
    if (entry.owner._id.toString() !== userId) {
      await entry.incrementView();
    }

    res.json({
      success: true,
      entry
    });
  } catch (err) {
    console.error('Get journal entry error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching journal entry'
    });
  }
};

// Update journal entry
exports.updateJournalEntry = async (req, res) => {
  try {
    const { entryId } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Find and verify ownership
    const entry = await JournalEntry.findById(entryId);
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    if (entry.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied to edit this journal entry'
      });
    }

    // Update fields
    const allowedFields = [
      'title', 'content', 'date', 'location', 'mood', 'weather',
      'highlights', 'photos', 'tags', 'isPublic', 'isPinned'
    ];

    const filteredData = {};
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    // Parse date
    if (filteredData.date) {
      filteredData.date = new Date(filteredData.date);
    }

    // Update entry
    Object.assign(entry, filteredData);
    await entry.save();

    // Populate and return
    await entry.populate('owner', 'fullName profilePic location');
    await entry.populate('trip', 'tripName place');

    res.json({
      success: true,
      message: 'Journal entry updated successfully',
      entry
    });
  } catch (err) {
    console.error('Update journal entry error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error updating journal entry'
    });
  }
};

// Delete journal entry
exports.deleteJournalEntry = async (req, res) => {
  try {
    const { entryId } = req.params;
    const userId = req.user.id;

    const entry = await JournalEntry.findOneAndDelete({
      _id: entryId,
      owner: userId
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found or access denied'
      });
    }

    // Remove entry reference from trip if associated
    if (entry.trip) {
      await Trip.findByIdAndUpdate(entry.trip, {
        $pull: { journalEntries: entry._id }
      });
    }

    res.json({
      success: true,
      message: 'Journal entry deleted successfully'
    });
  } catch (err) {
    console.error('Delete journal entry error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error deleting journal entry'
    });
  }
};

// Add photo to journal entry
exports.addPhoto = async (req, res) => {
  try {
    const { entryId } = req.params;
    const userId = req.user.id;
    const { url, caption } = req.body;

    const entry = await JournalEntry.findById(entryId);
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    if (entry.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied to edit this journal entry'
      });
    }

    await entry.addPhoto({ url, caption });
    await entry.populate('owner', 'fullName profilePic location');

    res.json({
      success: true,
      message: 'Photo added successfully',
      entry
    });
  } catch (err) {
    console.error('Add photo error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error adding photo'
    });
  }
};

// Remove photo from journal entry
exports.removePhoto = async (req, res) => {
  try {
    const { entryId, photoIndex } = req.params;
    const userId = req.user.id;

    const entry = await JournalEntry.findById(entryId);
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    if (entry.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied to edit this journal entry'
      });
    }

    await entry.removePhoto(parseInt(photoIndex));
    await entry.populate('owner', 'fullName profilePic location');

    res.json({
      success: true,
      message: 'Photo removed successfully',
      entry
    });
  } catch (err) {
    console.error('Remove photo error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error removing photo'
    });
  }
};

// Add highlight to journal entry
exports.addHighlight = async (req, res) => {
  try {
    const { entryId } = req.params;
    const userId = req.user.id;
    const { highlight } = req.body;

    const entry = await JournalEntry.findById(entryId);
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    if (entry.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied to edit this journal entry'
      });
    }

    await entry.addHighlight(highlight);
    await entry.populate('owner', 'fullName profilePic location');

    res.json({
      success: true,
      message: 'Highlight added successfully',
      entry
    });
  } catch (err) {
    console.error('Add highlight error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error adding highlight'
    });
  }
};

// Remove highlight from journal entry
exports.removeHighlight = async (req, res) => {
  try {
    const { entryId, highlightIndex } = req.params;
    const userId = req.user.id;

    const entry = await JournalEntry.findById(entryId);
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    if (entry.owner.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied to edit this journal entry'
      });
    }

    await entry.removeHighlight(parseInt(highlightIndex));
    await entry.populate('owner', 'fullName profilePic location');

    res.json({
      success: true,
      message: 'Highlight removed successfully',
      entry
    });
  } catch (err) {
    console.error('Remove highlight error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error removing highlight'
    });
  }
};

// Get journal entries by trip
exports.getEntriesByTrip = async (req, res) => {
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

    const entries = await JournalEntry.getEntriesByTrip(userId, tripId);

    res.json({
      success: true,
      entries
    });
  } catch (err) {
    console.error('Get entries by trip error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching trip entries'
    });
  }
};

// Get recent journal entries
exports.getRecentEntries = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    const entries = await JournalEntry.getRecentEntries(userId, parseInt(limit));

    res.json({
      success: true,
      entries
    });
  } catch (err) {
    console.error('Get recent entries error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching recent entries'
    });
  }
};

// Get journal statistics
exports.getJournalStatistics = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await JournalEntry.getEntryStatistics(userId);
    const locationStats = await JournalEntry.getLocationStats(userId);

    // Count mood breakdown
    const moodBreakdown = {};
    if (stats.length > 0 && stats[0].moodBreakdown) {
      stats[0].moodBreakdown.forEach(mood => {
        if (mood) {
          moodBreakdown[mood] = (moodBreakdown[mood] || 0) + 1;
        }
      });
    }

    res.json({
      success: true,
      statistics: {
        ...(stats[0] || {}),
        moodBreakdown,
        locationStats
      }
    });
  } catch (err) {
    console.error('Get journal statistics error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching statistics'
    });
  }
};

// Get public journal entries
exports.getPublicEntries = async (req, res) => {
  try {
    const {
      mood,
      location,
      tags,
      search,
      limit = 20,
      page = 1,
      sortBy = 'likes'
    } = req.query;

    let query = { isPublic: true };

    if (search) {
      query.$text = { $search: search };
    }

    if (mood) query.mood = mood;
    if (location) query.location = new RegExp(location, 'i');
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortBy === 'likes' ? -1 : -1;

    const entries = await JournalEntry.find(query)
      .populate('owner', 'fullName profilePic location')
      .populate('trip', 'tripName place')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await JournalEntry.countDocuments(query);

    res.json({
      success: true,
      entries,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (err) {
    console.error('Get public entries error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching public entries'
    });
  }
};

// Like/Unlike journal entry
exports.toggleLike = async (req, res) => {
  try {
    const { entryId } = req.params;
    const userId = req.user.id;

    const entry = await JournalEntry.findById(entryId);
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    const isLiked = entry.likedBy.includes(userId);
    
    if (isLiked) {
      await entry.removeLike(userId);
    } else {
      await entry.addLike(userId);
    }

    res.json({
      success: true,
      message: isLiked ? 'Like removed' : 'Like added',
      isLiked: !isLiked,
      likes: entry.likes
    });
  } catch (err) {
    console.error('Toggle like error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error toggling like'
    });
  }
};

// Add comment to journal entry
exports.addComment = async (req, res) => {
  try {
    const { entryId } = req.params;
    const userId = req.user.id;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    const entry = await JournalEntry.findById(entryId);
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    if (!entry.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Cannot comment on private entries'
      });
    }

    await entry.addComment(userId, content);
    await entry.populate('comments.user', 'fullName profilePic');

    res.json({
      success: true,
      message: 'Comment added successfully',
      comments: entry.comments
    });
  } catch (err) {
    console.error('Add comment error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error adding comment'
    });
  }
};

// Remove comment from journal entry
exports.removeComment = async (req, res) => {
  try {
    const { entryId, commentId } = req.params;
    const userId = req.user.id;

    const entry = await JournalEntry.findById(entryId);
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    // Check if user can remove comment (entry owner or comment author)
    const comment = entry.comments.find(c => c._id.toString() === commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const canRemove = 
      entry.owner.toString() === userId ||
      comment.user.toString() === userId;

    if (!canRemove) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied to remove this comment'
      });
    }

    await entry.removeComment(commentId);
    await entry.populate('comments.user', 'fullName profilePic');

    res.json({
      success: true,
      message: 'Comment removed successfully',
      comments: entry.comments
    });
  } catch (err) {
    console.error('Remove comment error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error removing comment'
    });
  }
};
