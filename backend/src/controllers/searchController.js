const Trip = require('../models/Trip');
const Itinerary = require('../models/Itinerary');
const JournalEntry = require('../models/JournalEntry');
const CalendarEvent = require('../models/CalendarEvent');
const Expense = require('../models/Expense');
const City = require('../models/City');

// Global search across all user's content
exports.globalSearch = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      q, // search query
      type, // 'all', 'trips', 'itineraries', 'journal', 'events', 'expenses', 'cities'
      limit = 10 
    } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const searchQuery = q.trim();
    const results = {};

    try {
      // Search trips
      if (!type || type === 'all' || type === 'trips') {
        results.trips = await Trip.find({
          owner: userId,
          $text: { $search: searchQuery }
        })
        .limit(parseInt(limit))
        .sort({ score: { $meta: 'textScore' } })
        .select('tripName place description startDate endDate status');
      }

      // Search itineraries
      if (!type || type === 'all' || type === 'itineraries') {
        results.itineraries = await Itinerary.find({
          owner: userId,
          $text: { $search: searchQuery }
        })
        .limit(parseInt(limit))
        .sort({ score: { $meta: 'textScore' } })
        .select('name description duration estimatedCost currency status');
      }

      // Search journal entries
      if (!type || type === 'all' || type === 'journal') {
        results.journal = await JournalEntry.find({
          owner: userId,
          $text: { $search: searchQuery }
        })
        .limit(parseInt(limit))
        .sort({ score: { $meta: 'textScore' } })
        .select('title content location date mood')
        .populate('trip', 'tripName place');
      }

      // Search calendar events
      if (!type || type === 'all' || type === 'events') {
        results.events = await CalendarEvent.find({
          owner: userId,
          $or: [
            { title: new RegExp(searchQuery, 'i') },
            { description: new RegExp(searchQuery, 'i') },
            { location: new RegExp(searchQuery, 'i') }
          ]
        })
        .limit(parseInt(limit))
        .sort({ startDate: -1 })
        .select('title description startDate endDate location type')
        .populate('relatedTrip', 'tripName place');
      }

      // Search expenses
      if (!type || type === 'all' || type === 'expenses') {
        results.expenses = await Expense.find({
          owner: userId,
          $or: [
            { description: new RegExp(searchQuery, 'i') },
            { location: new RegExp(searchQuery, 'i') },
            { tags: { $in: [new RegExp(searchQuery, 'i')] } }
          ]
        })
        .limit(parseInt(limit))
        .sort({ date: -1 })
        .select('description amount currency category date location')
        .populate('trip', 'tripName place');
      }

      // Search cities (if City model exists)
      if (!type || type === 'all' || type === 'cities') {
        try {
          results.cities = await City.find({
            $text: { $search: searchQuery }
          })
          .limit(parseInt(limit))
          .sort({ score: { $meta: 'textScore' } })
          .select('name country description attractions');
        } catch (err) {
          // City model might not exist, ignore
          results.cities = [];
        }
      }

    } catch (searchError) {
      console.error('Search error:', searchError);
      // Continue with partial results
    }

    // Calculate total results
    const totalResults = Object.values(results).reduce((sum, arr) => sum + (arr?.length || 0), 0);

    res.json({
      success: true,
      query: searchQuery,
      totalResults,
      results
    });
  } catch (err) {
    console.error('Global search error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during search'
    });
  }
};

// Advanced trip search with filters
exports.searchTrips = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      q,
      place,
      startDate,
      endDate,
      status,
      minBudget,
      maxBudget,
      travelStyle,
      tags,
      limit = 20,
      page = 1,
      sortBy = 'relevance'
    } = req.query;

    let query = { owner: userId };
    let sort = {};

    // Text search
    if (q) {
      query.$text = { $search: q };
      sort.score = { $meta: 'textScore' };
    }

    // Place filter
    if (place) {
      query.place = new RegExp(place, 'i');
    }

    // Date range filter
    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = new Date(startDate);
      if (endDate) query.startDate.$lte = new Date(endDate);
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // Budget range filter
    if (minBudget || maxBudget) {
      query.budget = {};
      if (minBudget) query.budget.$gte = parseFloat(minBudget);
      if (maxBudget) query.budget.$lte = parseFloat(maxBudget);
    }

    // Travel style filter
    if (travelStyle) {
      query.travelStyle = travelStyle;
    }

    // Tags filter
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }

    // Sorting
    if (sortBy !== 'relevance' || !q) {
      const sortOptions = {
        'recent': { createdAt: -1 },
        'oldest': { createdAt: 1 },
        'name': { tripName: 1 },
        'date': { startDate: -1 },
        'budget': { budget: -1 }
      };
      sort = sortOptions[sortBy] || { createdAt: -1 };
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const trips = await Trip.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('owner', 'fullName profilePic');

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
    console.error('Search trips error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error searching trips'
    });
  }
};

// Search public content
exports.searchPublic = async (req, res) => {
  try {
    const {
      q,
      type = 'all', // 'trips', 'itineraries', 'journal'
      location,
      tags,
      limit = 20,
      page = 1
    } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    const results = {};
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Search public trips
    if (type === 'all' || type === 'trips') {
      let tripQuery = { 
        isPublic: true,
        $text: { $search: q }
      };
      
      if (location) tripQuery.place = new RegExp(location, 'i');
      if (tags) {
        const tagArray = Array.isArray(tags) ? tags : [tags];
        tripQuery.tags = { $in: tagArray };
      }

      results.trips = await Trip.find(tripQuery)
        .populate('owner', 'fullName profilePic location')
        .sort({ score: { $meta: 'textScore' }, likes: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('tripName place description startDate endDate likes views tags');
    }

    // Search public itineraries
    if (type === 'all' || type === 'itineraries') {
      let itineraryQuery = { 
        isPublic: true,
        $text: { $search: q }
      };
      
      if (tags) {
        const tagArray = Array.isArray(tags) ? tags : [tags];
        itineraryQuery.tags = { $in: tagArray };
      }

      results.itineraries = await Itinerary.find(itineraryQuery)
        .populate('owner', 'fullName profilePic location')
        .sort({ score: { $meta: 'textScore' }, likes: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('name description duration estimatedCost currency likes views tags');
    }

    // Search public journal entries
    if (type === 'all' || type === 'journal') {
      let journalQuery = { 
        isPublic: true,
        $text: { $search: q }
      };
      
      if (location) journalQuery.location = new RegExp(location, 'i');
      if (tags) {
        const tagArray = Array.isArray(tags) ? tags : [tags];
        journalQuery.tags = { $in: tagArray };
      }

      results.journal = await JournalEntry.find(journalQuery)
        .populate('owner', 'fullName profilePic location')
        .populate('trip', 'tripName place')
        .sort({ score: { $meta: 'textScore' }, likes: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('title contentPreview location date mood likes views tags');
    }

    const totalResults = Object.values(results).reduce((sum, arr) => sum + (arr?.length || 0), 0);

    res.json({
      success: true,
      query: q,
      totalResults,
      results,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalResults / parseInt(limit)),
        totalItems: totalResults,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (err) {
    console.error('Search public content error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error searching public content'
    });
  }
};

// Get search suggestions
exports.getSearchSuggestions = async (req, res) => {
  try {
    const userId = req.user.id;
    const { q, limit = 5 } = req.query;

    if (!q || q.trim().length < 1) {
      return res.json({
        success: true,
        suggestions: []
      });
    }

    const searchTerm = q.trim();
    const suggestions = [];

    // Get recent trips
    const recentTrips = await Trip.find({
      owner: userId,
      $or: [
        { tripName: new RegExp(searchTerm, 'i') },
        { place: new RegExp(searchTerm, 'i') }
      ]
    })
    .limit(parseInt(limit))
    .select('tripName place')
    .sort({ lastAccessedAt: -1 });

    recentTrips.forEach(trip => {
      suggestions.push({
        type: 'trip',
        text: trip.tripName,
        subtitle: trip.place,
        id: trip._id
      });
    });

    // Get recent locations
    const locations = await Trip.aggregate([
      { $match: { owner: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$place', count: { $sum: 1 } } },
      { $match: { _id: new RegExp(searchTerm, 'i') } },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) }
    ]);

    locations.forEach(location => {
      suggestions.push({
        type: 'location',
        text: location._id,
        subtitle: `${location.count} trips`,
        id: location._id
      });
    });

    res.json({
      success: true,
      suggestions: suggestions.slice(0, parseInt(limit))
    });
  } catch (err) {
    console.error('Get search suggestions error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error getting search suggestions'
    });
  }
};

// Get popular search terms
exports.getPopularSearches = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get popular destinations from trips
    const popularDestinations = await Trip.aggregate([
      { $match: { isPublic: true } },
      { $group: { _id: '$place', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) }
    ]);

    // Get popular tags
    const popularTags = await Trip.aggregate([
      { $match: { isPublic: true } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: parseInt(limit) }
    ]);

    res.json({
      success: true,
      popularDestinations: popularDestinations.map(item => ({
        term: item._id,
        count: item.count
      })),
      popularTags: popularTags.map(item => ({
        term: item._id,
        count: item.count
      }))
    });
  } catch (err) {
    console.error('Get popular searches error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error getting popular searches'
    });
  }
};
