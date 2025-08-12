const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  // Link to user and trip
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true, index: true },
  
  // Expense details (from frontend ExpensePage.jsx)
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
  description: String,
  date: { type: Date, default: Date.now },
  
  // Additional metadata
  receiptUrl: String, // For future file upload feature
  location: String, // Where the expense was incurred
  notes: String,
  
  // Payment method tracking
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'digital', 'other'],
    default: 'card'
  },
  
  // Status and verification
  isVerified: { type: Boolean, default: false },
  tags: [String], // For custom categorization
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for performance
ExpenseSchema.index({ user: 1, tripId: 1 });
ExpenseSchema.index({ user: 1, date: -1 });
ExpenseSchema.index({ category: 1 });
ExpenseSchema.index({ createdAt: -1 });

// Pre-save middleware
ExpenseSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static methods for analytics
ExpenseSchema.statics.getTotalByCategory = async function(userId, tripId) {
  return await this.aggregate([
    { $match: { user: userId, tripId: tripId } },
    { 
      $group: { 
        _id: '$category', 
        total: { $sum: '$amount' }, 
        count: { $sum: 1 },
        avgAmount: { $avg: '$amount' }
      } 
    },
    { $sort: { total: -1 } }
  ]);
};

ExpenseSchema.statics.getTotalByTrip = async function(userId, tripId) {
  const result = await this.aggregate([
    { $match: { user: userId, tripId: tripId } },
    { 
      $group: { 
        _id: null, 
        total: { $sum: '$amount' }, 
        count: { $sum: 1 },
        avgAmount: { $avg: '$amount' }
      } 
    }
  ]);
  return result[0] || { total: 0, count: 0, avgAmount: 0 };
};

ExpenseSchema.statics.getExpensesByDateRange = async function(userId, startDate, endDate) {
  return await this.find({
    user: userId,
    date: { $gte: startDate, $lte: endDate }
  }).populate('tripId', 'tripName place').sort({ date: -1 });
};

module.exports = mongoose.model('Expense', ExpenseSchema);
