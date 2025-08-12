const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const Trip = require('../models/Trip');

// Create a new budget
exports.createBudget = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { tripId, category, amount, currency, startDate, endDate, alertThreshold, alertsEnabled, notes } = req.body;

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
        message: 'Budget amount must be greater than 0'
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

    // Check if budget already exists for this trip+category
    const existingBudget = await Budget.findOne({ user: userId, tripId, category, isActive: true });
    if (existingBudget) {
      return res.status(400).json({
        success: false,
        message: 'Budget already exists for this category in this trip'
      });
    }

    // Create budget
    const budget = await Budget.create({
      user: userId,
      tripId,
      category,
      amount: parseFloat(amount),
      currency: currency || 'USD',
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      alertThreshold: alertThreshold || 80,
      alertsEnabled: alertsEnabled !== undefined ? alertsEnabled : true,
      notes
    });

    // Populate trip information
    await budget.populate('tripId', 'tripName place');

    res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      budget
    });
  } catch (err) {
    console.error('Create budget error:', err);
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Budget already exists for this category in this trip'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error creating budget'
    });
  }
};

// Get user's budgets with optional filters
exports.getBudgets = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { tripId, category, isActive = true } = req.query;

    // Build query
    const query = { user: userId };
    
    if (tripId) query.tripId = tripId;
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    // Get budgets
    const budgets = await Budget.find(query)
      .populate('tripId', 'tripName place')
      .sort({ createdAt: -1 });

    // Enhance with spending data
    const enhancedBudgets = await Promise.all(
      budgets.map(async (budget) => {
        const spentAmount = await budget.getSpentAmount();
        const percentage = await budget.getSpentPercentage();
        const remainingAmount = await budget.getRemainingAmount();
        const isOverBudget = await budget.isOverBudget();
        const shouldAlert = await budget.shouldAlert();

        return {
          ...budget.toObject(),
          spentAmount,
          percentage: Math.round(percentage * 100) / 100,
          remainingAmount,
          isOverBudget,
          shouldAlert
        };
      })
    );

    res.json({
      success: true,
      budgets: enhancedBudgets
    });
  } catch (err) {
    console.error('Get budgets error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching budgets'
    });
  }
};

// Get budget by ID
exports.getBudgetById = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { budgetId } = req.params;

    const budget = await Budget.findOne({ _id: budgetId, user: userId })
      .populate('tripId', 'tripName place');

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Enhance with spending data
    const spentAmount = await budget.getSpentAmount();
    const percentage = await budget.getSpentPercentage();
    const remainingAmount = await budget.getRemainingAmount();
    const isOverBudget = await budget.isOverBudget();
    const shouldAlert = await budget.shouldAlert();

    res.json({
      success: true,
      budget: {
        ...budget.toObject(),
        spentAmount,
        percentage: Math.round(percentage * 100) / 100,
        remainingAmount,
        isOverBudget,
        shouldAlert
      }
    });
  } catch (err) {
    console.error('Get budget error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching budget'
    });
  }
};

// Update budget
exports.updateBudget = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { budgetId } = req.params;
    const { amount, currency, startDate, endDate, alertThreshold, alertsEnabled, notes, isActive } = req.body;

    // Find and verify ownership
    const budget = await Budget.findOne({ _id: budgetId, user: userId });
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Update fields
    if (amount !== undefined) {
      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Budget amount must be greater than 0'
        });
      }
      budget.amount = parseFloat(amount);
    }
    if (currency !== undefined) budget.currency = currency;
    if (startDate !== undefined) budget.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) budget.endDate = endDate ? new Date(endDate) : null;
    if (alertThreshold !== undefined) budget.alertThreshold = alertThreshold;
    if (alertsEnabled !== undefined) budget.alertsEnabled = alertsEnabled;
    if (notes !== undefined) budget.notes = notes;
    if (isActive !== undefined) budget.isActive = isActive;

    await budget.save();
    await budget.populate('tripId', 'tripName place');

    // Enhance with spending data
    const spentAmount = await budget.getSpentAmount();
    const percentage = await budget.getSpentPercentage();
    const remainingAmount = await budget.getRemainingAmount();
    const isOverBudget = await budget.isOverBudget();
    const shouldAlert = await budget.shouldAlert();

    res.json({
      success: true,
      message: 'Budget updated successfully',
      budget: {
        ...budget.toObject(),
        spentAmount,
        percentage: Math.round(percentage * 100) / 100,
        remainingAmount,
        isOverBudget,
        shouldAlert
      }
    });
  } catch (err) {
    console.error('Update budget error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error updating budget'
    });
  }
};

// Delete budget
exports.deleteBudget = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { budgetId } = req.params;

    const budget = await Budget.findOneAndDelete({ _id: budgetId, user: userId });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    res.json({
      success: true,
      message: 'Budget deleted successfully'
    });
  } catch (err) {
    console.error('Delete budget error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error deleting budget'
    });
  }
};

// Get budget summary for a trip
exports.getTripBudgetSummary = async (req, res) => {
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

    // Get budget summary
    const summary = await Budget.getBudgetSummary(userId, tripId);

    res.json({
      success: true,
      tripId,
      tripName: trip.tripName,
      budgetSummary: summary
    });
  } catch (err) {
    console.error('Get budget summary error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching budget summary'
    });
  }
};

// Get budget alerts for user
exports.getBudgetAlerts = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    // Get all active budgets
    const budgets = await Budget.find({ user: userId, isActive: true, alertsEnabled: true })
      .populate('tripId', 'tripName place');

    // Check which budgets need alerts
    const alerts = [];
    for (const budget of budgets) {
      const shouldAlert = await budget.shouldAlert();
      const isOverBudget = await budget.isOverBudget();
      const percentage = await budget.getSpentPercentage();
      const spentAmount = await budget.getSpentAmount();

      if (shouldAlert || isOverBudget) {
        alerts.push({
          budgetId: budget._id,
          tripId: budget.tripId._id,
          tripName: budget.tripId.tripName,
          category: budget.category,
          budgetAmount: budget.amount,
          spentAmount,
          percentage: Math.round(percentage * 100) / 100,
          alertThreshold: budget.alertThreshold,
          isOverBudget,
          severity: isOverBudget ? 'high' : percentage >= 90 ? 'medium' : 'low',
          message: isOverBudget 
            ? `You've exceeded your ${budget.category} budget by ${Math.round((percentage - 100) * 100) / 100}%`
            : `You've spent ${Math.round(percentage * 100) / 100}% of your ${budget.category} budget`
        });
      }
    }

    res.json({
      success: true,
      alerts: alerts.sort((a, b) => b.percentage - a.percentage)
    });
  } catch (err) {
    console.error('Get budget alerts error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching budget alerts'
    });
  }
};

// Clone budget from another trip
exports.cloneBudget = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { sourceTripId, targetTripId } = req.body;

    if (!sourceTripId || !targetTripId) {
      return res.status(400).json({
        success: false,
        message: 'Source and target trip IDs are required'
      });
    }

    // Verify both trips belong to user
    const [sourceTrip, targetTrip] = await Promise.all([
      Trip.findOne({ _id: sourceTripId, owner: userId }),
      Trip.findOne({ _id: targetTripId, owner: userId })
    ]);

    if (!sourceTrip || !targetTrip) {
      return res.status(404).json({
        success: false,
        message: 'One or both trips not found or access denied'
      });
    }

    // Get budgets from source trip
    const sourceBudgets = await Budget.find({ user: userId, tripId: sourceTripId, isActive: true });

    if (sourceBudgets.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No budgets found in source trip'
      });
    }

    // Clone budgets to target trip
    const clonedBudgets = [];
    for (const sourceBudget of sourceBudgets) {
      // Check if budget already exists in target trip
      const existingBudget = await Budget.findOne({ 
        user: userId, 
        tripId: targetTripId, 
        category: sourceBudget.category, 
        isActive: true 
      });

      if (!existingBudget) {
        const clonedBudget = await Budget.create({
          user: userId,
          tripId: targetTripId,
          category: sourceBudget.category,
          amount: sourceBudget.amount,
          currency: sourceBudget.currency,
          alertThreshold: sourceBudget.alertThreshold,
          alertsEnabled: sourceBudget.alertsEnabled,
          notes: `Cloned from ${sourceTrip.tripName}`
        });
        clonedBudgets.push(clonedBudget);
      }
    }

    res.json({
      success: true,
      message: `Cloned ${clonedBudgets.length} budgets to ${targetTrip.tripName}`,
      clonedBudgets
    });
  } catch (err) {
    console.error('Clone budget error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error cloning budgets'
    });
  }
};
