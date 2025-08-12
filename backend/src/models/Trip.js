const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TripSchema = new Schema({
  // Basic trip info (from frontend TripsPage and PlanPage)
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tripName: { type: String, required: true },
  place: { type: String, required: true }, // Destination
  description: String,
  startDate: Date,
  endDate: Date,
  
  // Trip details
  budget: { type: Number, default: 0, min: 0 },
  currency: { type: String, default: 'USD' },
  travelers: { type: Number, default: 1, min: 1 },
  travelStyle: { 
    type: String, 
    enum: ['solo', 'couple', 'family', 'friends', 'business'], 
    default: 'solo' 
  },
  
  // Suggestions/POIs (from PlanPage)
  suggestions: [{
    id: String,
    name: String,
    kinds: String, // Categories/tags
    image: String,
    wikiPageId: String,
    cost: { type: Number, default: 0 },
    duration: String, // e.g., "2h", "30min"
    category: String,
    notes: String,
    isSelected: { type: Boolean, default: false }
  }],
  
  // Transportation info
  transportation: {
    arrival: {
      method: String, // flight, train, car, etc.
      details: String,
      date: Date,
      cost: Number
    },
    departure: {
      method: String,
      details: String,
      date: Date,
      cost: Number
    }
  },
  
  // Accommodation
  accommodation: {
    name: String,
    type: String, // hotel, hostel, airbnb, etc.
    address: String,
    checkIn: Date,
    checkOut: Date,
    cost: Number,
    notes: String
  },
  
  // Trip visibility and sharing
  isPublic: { type: Boolean, default: false },
  sharedWith: [{ 
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['viewer', 'editor'], default: 'viewer' },
    sharedAt: { type: Date, default: Date.now }
  }],
  
  // Social features
  likes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  bookmarks: { type: Number, default: 0 },
  
  // References to related documents
  itineraries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Itinerary' }],
  expenses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Expense' }],
  journalEntries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'JournalEntry' }],
  
  // Trip status and metadata
  status: { 
    type: String, 
    default: 'draft', 
    enum: ['draft', 'planning', 'confirmed', 'ongoing', 'completed', 'cancelled'] 
  },
  tags: [String],
  notes: String,
  weatherInfo: mongoose.Schema.Types.Mixed, // Store weather data
  
  // Collaboration and activity
  lastAccessedAt: { type: Date, default: Date.now },
  completionPercentage: { type: Number, default: 0, min: 0, max: 100 },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for performance
TripSchema.index({ owner: 1, updatedAt: -1 });
TripSchema.index({ place: 'text', tripName: 'text', description: 'text' });
TripSchema.index({ startDate: 1, endDate: 1 });
TripSchema.index({ status: 1 });
TripSchema.index({ isPublic: 1, likes: -1 });
TripSchema.index({ tags: 1 });

// Virtual for trip duration in days
TripSchema.virtual('durationInDays').get(function() {
  if (!this.startDate || !this.endDate) return null;
  const diffTime = Math.abs(this.endDate - this.startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for total estimated cost
TripSchema.virtual('estimatedCost').get(function() {
  let total = this.budget || 0;
  
  // Add accommodation cost
  if (this.accommodation && this.accommodation.cost) {
    total += this.accommodation.cost;
  }
  
  // Add transportation costs
  if (this.transportation.arrival && this.transportation.arrival.cost) {
    total += this.transportation.arrival.cost;
  }
  if (this.transportation.departure && this.transportation.departure.cost) {
    total += this.transportation.departure.cost;
  }
  
  // Add suggestion costs
  if (this.suggestions) {
    total += this.suggestions.reduce((sum, suggestion) => 
      sum + (suggestion.cost || 0), 0);
  }
  
  return total;
});

// Virtual for current trip status based on dates
TripSchema.virtual('currentStatus').get(function() {
  if (!this.startDate || !this.endDate) return this.status;
  
  const now = new Date();
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);
  
  if (start > now) return 'upcoming';
  if (end < now) return 'completed';
  if (start <= now && end >= now) return 'ongoing';
  
  return this.status;
});

// Pre-save middleware
TripSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  this.lastAccessedAt = new Date();
  
  // Calculate completion percentage based on various factors
  let completionScore = 0;
  let totalPossibleScore = 100;
  
  // Basic info completion (30%)
  if (this.tripName) completionScore += 10;
  if (this.place) completionScore += 10;
  if (this.startDate && this.endDate) completionScore += 10;
  
  // Planning completion (40%)
  if (this.suggestions && this.suggestions.length > 0) completionScore += 20;
  if (this.accommodation && this.accommodation.name) completionScore += 10;
  if (this.transportation.arrival && this.transportation.arrival.method) completionScore += 10;
  
  // Budget completion (20%)
  if (this.budget > 0) completionScore += 20;
  
  // Additional details (10%)
  if (this.description) completionScore += 5;
  if (this.tags && this.tags.length > 0) completionScore += 5;
  
  this.completionPercentage = Math.min(completionScore, 100);
  
  next();
});

// Instance methods
TripSchema.methods.addSuggestion = function(suggestionData) {
  this.suggestions.push({
    id: require('crypto').randomUUID(),
    ...suggestionData
  });
  return this.save();
};

TripSchema.methods.updateSuggestion = function(suggestionId, updateData) {
  const suggestion = this.suggestions.find(s => s.id === suggestionId);
  if (!suggestion) throw new Error('Suggestion not found');
  
  Object.assign(suggestion, updateData);
  return this.save();
};

TripSchema.methods.removeSuggestion = function(suggestionId) {
  this.suggestions = this.suggestions.filter(s => s.id !== suggestionId);
  return this.save();
};

TripSchema.methods.shareWith = function(userId, role = 'viewer') {
  // Check if user is already shared with
  const existingShare = this.sharedWith.find(share => 
    share.user.toString() === userId.toString());
  
  if (existingShare) {
    existingShare.role = role;
  } else {
    this.sharedWith.push({ user: userId, role });
  }
  
  return this.save();
};

TripSchema.methods.unshareWith = function(userId) {
  this.sharedWith = this.sharedWith.filter(share => 
    share.user.toString() !== userId.toString());
  return this.save();
};

TripSchema.methods.incrementView = function() {
  this.views += 1;
  this.lastAccessedAt = new Date();
  return this.save();
};

TripSchema.methods.clone = function(newOwner, newName) {
  const clonedData = {
    owner: newOwner,
    tripName: newName || `${this.tripName} (Copy)`,
    place: this.place,
    description: this.description,
    startDate: this.startDate,
    endDate: this.endDate,
    budget: this.budget,
    currency: this.currency,
    travelers: this.travelers,
    travelStyle: this.travelStyle,
    suggestions: this.suggestions.map(s => ({
      ...s.toObject(),
      id: require('crypto').randomUUID()
    })),
    transportation: { ...this.transportation },
    accommodation: { ...this.accommodation },
    tags: [...this.tags],
    notes: this.notes,
    status: 'draft',
    isPublic: false
  };
  
  return mongoose.model('Trip').create(clonedData);
};

// Static methods
TripSchema.statics.getUpcomingTrips = function(userId, limit = 10) {
  const now = new Date();
  return this.find({ 
    owner: userId, 
    startDate: { $gte: now },
    status: { $in: ['planning', 'confirmed'] }
  })
  .sort({ startDate: 1 })
  .limit(limit);
};

TripSchema.statics.getRecentTrips = function(userId, limit = 10) {
  return this.find({ owner: userId })
    .sort({ lastAccessedAt: -1 })
    .limit(limit);
};

TripSchema.statics.getTripStatistics = function(userId) {
  return this.aggregate([
    { $match: { owner: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalBudget: { $sum: '$budget' }
      }
    }
  ]);
};

// Don't include sensitive data in JSON
TripSchema.methods.toJSON = function() {
  const trip = this.toObject({ virtuals: true });
  return trip;
};

module.exports = mongoose.model('Trip', TripSchema);
