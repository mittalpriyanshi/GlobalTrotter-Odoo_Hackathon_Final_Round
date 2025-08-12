const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
  // Link to user and trip
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true, index: true },
  
  // Budget details (from frontend ExpensePage.jsx)
  category: { 
    type: String, 
    required: true,
    enum: [
      'Accommodation', 
      'Transportation', 
      'Food', 
      'Activities', 
      'Shopping', 
      'Emergency', 
      'Tips', 
      'Insurance', 
      'Visas', 
      'Other'
    ]
  },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'USD', required: true },
  
  // Budget period
  startDate: Date,
  endDate: Date,
  
  // Alert settings
  alertThreshold: { type: Number, default: 80, min: 0, max: 100 }, // Alert when % spent
  alertsEnabled: { type: Boolean, default: true },
  
  // Status
  isActive: { type: Boolean, default: true },
  notes: String,
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Composite index to prevent duplicate budgets for same trip+category
BudgetSchema.index({ user: 1, tripId: 1, category: 1 }, { unique: true });
BudgetSchema.index({ user: 1, createdAt: -1 });

// Pre-save middleware
BudgetSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual to calculate spent amount and percentage
BudgetSchema.virtual('spentAmount', {
  ref: 'Expense',
  localField: '_id',
  foreignField: 'budgetId',
  count: false
});

// Instance methods
BudgetSchema.methods.getSpentAmount = async function() {
  const Expense = mongoose.model('Expense');
  const result = await Expense.aggregate([
    { 
      $match: { 
        user: this.user, 
        tripId: this.tripId, 
        category: this.category 
      } 
    },
    { 
      $group: { 
        _id: null, 
        total: { $sum: '$amount' } 
      } 
    }
  ]);
  return result[0]?.total || 0;
};

BudgetSchema.methods.getSpentPercentage = async function() {
  const spent = await this.getSpentAmount();
  return this.amount > 0 ? (spent / this.amount) * 100 : 0;
};

BudgetSchema.methods.getRemainingAmount = async function() {
  const spent = await this.getSpentAmount();
  return Math.max(0, this.amount - spent);
};

BudgetSchema.methods.isOverBudget = async function() {
  const spent = await this.getSpentAmount();
  return spent > this.amount;
};

BudgetSchema.methods.shouldAlert = async function() {
  if (!this.alertsEnabled) return false;
  const percentage = await this.getSpentPercentage();
  return percentage >= this.alertThreshold;
};

// Static methods
BudgetSchema.statics.getBudgetSummary = async function(userId, tripId) {
  const budgets = await this.find({ user: userId, tripId: tripId, isActive: true });
  const Expense = mongoose.model('Expense');
  
  const summary = {
    totalBudget: 0,
    totalSpent: 0,
    totalRemaining: 0,
    categories: [],
    overBudgetCategories: [],
    alertCategories: []
  };
  
  for (const budget of budgets) {
    const spent = await budget.getSpentAmount();
    const remaining = await budget.getRemainingAmount();
    const percentage = await budget.getSpentPercentage();
    const isOverBudget = await budget.isOverBudget();
    const shouldAlert = await budget.shouldAlert();
    
    summary.totalBudget += budget.amount;
    summary.totalSpent += spent;
    summary.totalRemaining += remaining;
    
    const categoryData = {
      category: budget.category,
      budgetAmount: budget.amount,
      spentAmount: spent,
      remainingAmount: remaining,
      percentage: percentage,
      isOverBudget: isOverBudget,
      shouldAlert: shouldAlert,
      currency: budget.currency
    };
    
    summary.categories.push(categoryData);
    
    if (isOverBudget) {
      summary.overBudgetCategories.push(categoryData);
    }
    
    if (shouldAlert) {
      summary.alertCategories.push(categoryData);
    }
  }
  
  return summary;
};

module.exports = mongoose.model('Budget', BudgetSchema);
