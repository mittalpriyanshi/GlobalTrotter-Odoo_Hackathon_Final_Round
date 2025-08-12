const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const Trip = require('../models/Trip');

// Create a new expense
exports.createExpense = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { tripId, category, amount, currency, description, date, paymentMethod, location, notes, tags } = req.body;

    // Validation
    if (!tripId || !category || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Trip, category, and amount are required'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    // Verify trip belongs to user
    const trip = await Trip.findOne({ _id: tripId, owner: userId });
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found or access denied'
      });
    }

    // Create expense
    const expense = await Expense.create({
      user: userId,
      tripId,
      category,
      amount: parseFloat(amount),
      currency: currency || 'USD',
      description,
      date: date || new Date(),
      paymentMethod,
      location,
      notes,
      tags: Array.isArray(tags) ? tags : []
    });

    // Populate trip information
    await expense.populate('tripId', 'tripName place');

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      expense
    });
  } catch (err) {
    console.error('Create expense error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error creating expense'
    });
  }
};

// Get user's expenses with optional filters
exports.getExpenses = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { tripId, category, startDate, endDate, limit = 50, page = 1 } = req.query;

    // Build query
    const query = { user: userId };
    
    if (tripId) query.tripId = tripId;
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const expenses = await Expense.find(query)
      .populate('tripId', 'tripName place')
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalCount = await Expense.countDocuments(query);

    res.json({
      success: true,
      expenses,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (err) {
    console.error('Get expenses error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching expenses'
    });
  }
};

// Get expense by ID
exports.getExpenseById = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { expenseId } = req.params;

    const expense = await Expense.findOne({ _id: expenseId, user: userId })
      .populate('tripId', 'tripName place');

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.json({
      success: true,
      expense
    });
  } catch (err) {
    console.error('Get expense error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching expense'
    });
  }
};

// Update expense
exports.updateExpense = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { expenseId } = req.params;
    const { category, amount, currency, description, date, paymentMethod, location, notes, tags } = req.body;

    // Find and verify ownership
    const expense = await Expense.findOne({ _id: expenseId, user: userId });
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Update fields
    if (category !== undefined) expense.category = category;
    if (amount !== undefined) {
      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be greater than 0'
        });
      }
      expense.amount = parseFloat(amount);
    }
    if (currency !== undefined) expense.currency = currency;
    if (description !== undefined) expense.description = description;
    if (date !== undefined) expense.date = new Date(date);
    if (paymentMethod !== undefined) expense.paymentMethod = paymentMethod;
    if (location !== undefined) expense.location = location;
    if (notes !== undefined) expense.notes = notes;
    if (tags !== undefined) expense.tags = Array.isArray(tags) ? tags : [];

    await expense.save();
    await expense.populate('tripId', 'tripName place');

    res.json({
      success: true,
      message: 'Expense updated successfully',
      expense
    });
  } catch (err) {
    console.error('Update expense error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error updating expense'
    });
  }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { expenseId } = req.params;

    const expense = await Expense.findOneAndDelete({ _id: expenseId, user: userId });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (err) {
    console.error('Delete expense error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error deleting expense'
    });
  }
};

// Get expense analytics for a trip
exports.getTripExpenseAnalytics = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { tripId } = req.params;

    // Verify trip ownership
    const trip = await Trip.findOne({ _id: tripId, owner: userId });
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found or access denied'
      });
    }

    // Get analytics
    const [totalStats, categoryBreakdown] = await Promise.all([
      Expense.getTotalByTrip(userId, tripId),
      Expense.getTotalByCategory(userId, tripId)
    ]);

    // Get budget comparison if budgets exist
    const budgetSummary = await Budget.getBudgetSummary(userId, tripId);

    res.json({
      success: true,
      analytics: {
        tripId,
        tripName: trip.tripName,
        totalStats,
        categoryBreakdown,
        budgetSummary
      }
    });
  } catch (err) {
    console.error('Get analytics error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching analytics'
    });
  }
};

// Get expense statistics for user
exports.getUserExpenseStats = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { period = '30d' } = req.query; // 7d, 30d, 90d, 1y

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default: // 30d
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get expenses in period
    const expenses = await Expense.getExpensesByDateRange(userId, startDate, now);

    // Calculate statistics
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const expenseCount = expenses.length;
    const avgPerExpense = expenseCount > 0 ? totalAmount / expenseCount : 0;

    // Category breakdown
    const categoryStats = {};
    expenses.forEach(expense => {
      if (!categoryStats[expense.category]) {
        categoryStats[expense.category] = { total: 0, count: 0 };
      }
      categoryStats[expense.category].total += expense.amount;
      categoryStats[expense.category].count += 1;
    });

    // Trip breakdown
    const tripStats = {};
    expenses.forEach(expense => {
      const tripId = expense.tripId._id.toString();
      if (!tripStats[tripId]) {
        tripStats[tripId] = {
          tripName: expense.tripId.tripName,
          place: expense.tripId.place,
          total: 0,
          count: 0
        };
      }
      tripStats[tripId].total += expense.amount;
      tripStats[tripId].count += 1;
    });

    res.json({
      success: true,
      stats: {
        period,
        dateRange: { startDate, endDate: now },
        overview: {
          totalAmount,
          expenseCount,
          avgPerExpense,
          avgPerDay: totalAmount / Math.ceil((now - startDate) / (24 * 60 * 60 * 1000))
        },
        categoryStats,
        tripStats
      }
    });
  } catch (err) {
    console.error('Get user stats error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching statistics'
    });
  }
};
