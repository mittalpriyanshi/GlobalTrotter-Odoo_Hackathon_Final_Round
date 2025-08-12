const mongoose = require('mongoose');

// Activity schema for individual activities within stops
const ActivitySchema = new mongoose.Schema({
  id: { type: String, default: () => require('crypto').randomUUID() },
  name: { type: String, required: true },
  time: String, // HH:MM format
  duration: String, // e.g., "2h", "30min"
  cost: { type: Number, default: 0, min: 0 },
  currency: { type: String, default: 'USD' },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'], 
    default: 'medium' 
  },
  completed: { type: Boolean, default: false },
  notes: String,
  category: {
    type: String,
    enum: [
      'Sightseeing', 
      'Food & Dining', 
      'Adventure', 
      'Cultural', 
      'Shopping', 
      'Entertainment', 
      'Transportation', 
      'Accommodation', 
      'Relaxation', 
      'Other'
    ]
  },
  location: String,
  bookingInfo: {
    isBooked: { type: Boolean, default: false },
    bookingReference: String,
    bookingUrl: String,
    contactInfo: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { _id: false });

// Stop schema for individual destinations/cities in the itinerary
const StopSchema = new mongoose.Schema({
  id: { type: String, default: () => require('crypto').randomUUID() },
  city: { type: String, required: true },
  country: String,
  startDate: Date,
  endDate: Date,
  accommodation: String,
  budget: { type: Number, default: 0, min: 0 },
  currency: { type: String, default: 'USD' },
  notes: String,
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  activities: [ActivitySchema],
  dayPlans: [{
    date: Date,
    activities: [String], // Array of activity IDs
    notes: String
  }],
  transportation: {
    arrivalMethod: String, // flight, train, car, etc.
    departureMethod: String,
    arrivalDetails: String,
    departureDetails: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { _id: false });

// Main Itinerary schema
const ItinerarySchema = new mongoose.Schema({
  // Basic information
  name: { type: String, required: true },
  description: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  
  // Trip association (optional - itinerary can exist without a trip)
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', index: true },
  
  // Itinerary structure
  stops: [StopSchema],
  
  // Budget and financial info
  totalBudget: { type: Number, default: 0, min: 0 },
  currency: { type: String, default: 'USD' },
  estimatedCost: { type: Number, default: 0 }, // Calculated from activities
  
  // Duration and dates
  startDate: Date,
  endDate: Date,
  duration: String, // "7 days", "2 weeks", etc.
  
  // Collaboration and sharing
  isPublic: { type: Boolean, default: false },
  isTemplate: { type: Boolean, default: false },
  collaborators: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['viewer', 'editor', 'admin'], default: 'viewer' },
    addedAt: { type: Date, default: Date.now }
  }],
  
  // Metadata
  tags: [String],
  difficulty: { type: String, enum: ['easy', 'moderate', 'challenging'], default: 'moderate' },
  travelStyle: { type: String, enum: ['solo', 'couple', 'family', 'friends', 'business'] },
  
  // Social features for public itineraries
  likes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  bookmarks: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  bookmarkedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Status and versioning
  status: { 
    type: String, 
    enum: ['draft', 'planning', 'confirmed', 'active', 'completed', 'cancelled'], 
    default: 'draft' 
  },
  version: { type: Number, default: 1 },
  parentItinerary: { type: mongoose.Schema.Types.ObjectId, ref: 'Itinerary' }, // For cloned itineraries
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastAccessedAt: { type: Date, default: Date.now }
});

// Indexes for performance
ItinerarySchema.index({ owner: 1, createdAt: -1 });
ItinerarySchema.index({ isPublic: 1, likes: -1 }); // For public itinerary discovery
ItinerarySchema.index({ tags: 1 });
ItinerarySchema.index({ 'stops.city': 'text', name: 'text', description: 'text' });
ItinerarySchema.index({ startDate: 1, endDate: 1 });

// Pre-save middleware
ItinerarySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Calculate estimated cost from activities
  let totalCost = 0;
  this.stops.forEach(stop => {
    totalCost += stop.budget || 0;
    stop.activities.forEach(activity => {
      totalCost += activity.cost || 0;
    });
    stop.updatedAt = new Date();
  });
  this.estimatedCost = totalCost;
  
  // Calculate duration if start and end dates are set
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    this.duration = diffDays === 1 ? '1 day' : `${diffDays} days`;
  }
  
  next();
});

// Virtual for total activities count
ItinerarySchema.virtual('totalActivities').get(function() {
  return this.stops.reduce((total, stop) => total + stop.activities.length, 0);
});

// Virtual for completed activities count
ItinerarySchema.virtual('completedActivities').get(function() {
  return this.stops.reduce((total, stop) => 
    total + stop.activities.filter(activity => activity.completed).length, 0
  );
});

// Virtual for progress percentage
ItinerarySchema.virtual('progressPercentage').get(function() {
  const total = this.totalActivities;
  const completed = this.completedActivities;
  return total > 0 ? Math.round((completed / total) * 100) : 0;
});

// Instance methods
ItinerarySchema.methods.addStop = function(stopData) {
  this.stops.push({
    id: require('crypto').randomUUID(),
    ...stopData,
    activities: [],
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return this.save();
};

ItinerarySchema.methods.removeStop = function(stopId) {
  this.stops = this.stops.filter(stop => stop.id !== stopId);
  return this.save();
};

ItinerarySchema.methods.addActivity = function(stopId, activityData) {
  const stop = this.stops.find(s => s.id === stopId);
  if (!stop) throw new Error('Stop not found');
  
  stop.activities.push({
    id: require('crypto').randomUUID(),
    ...activityData,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  stop.updatedAt = new Date();
  return this.save();
};

ItinerarySchema.methods.updateActivity = function(stopId, activityId, updateData) {
  const stop = this.stops.find(s => s.id === stopId);
  if (!stop) throw new Error('Stop not found');
  
  const activity = stop.activities.find(a => a.id === activityId);
  if (!activity) throw new Error('Activity not found');
  
  Object.assign(activity, updateData, { updatedAt: new Date() });
  stop.updatedAt = new Date();
  return this.save();
};

ItinerarySchema.methods.removeActivity = function(stopId, activityId) {
  const stop = this.stops.find(s => s.id === stopId);
  if (!stop) throw new Error('Stop not found');
  
  stop.activities = stop.activities.filter(a => a.id !== activityId);
  stop.updatedAt = new Date();
  return this.save();
};

ItinerarySchema.methods.moveStop = function(fromIndex, toIndex) {
  if (fromIndex < 0 || fromIndex >= this.stops.length || 
      toIndex < 0 || toIndex >= this.stops.length) {
    throw new Error('Invalid stop index');
  }
  
  const stop = this.stops.splice(fromIndex, 1)[0];
  this.stops.splice(toIndex, 0, stop);
  return this.save();
};

ItinerarySchema.methods.cloneItinerary = function(newOwner, newName) {
  const clonedData = {
    name: newName || `${this.name} (Copy)`,
    description: this.description,
    owner: newOwner,
    stops: this.stops.map(stop => ({
      ...stop.toObject(),
      id: require('crypto').randomUUID(),
      activities: stop.activities.map(activity => ({
        ...activity.toObject(),
        id: require('crypto').randomUUID()
      }))
    })),
    totalBudget: this.totalBudget,
    currency: this.currency,
    tags: [...this.tags],
    difficulty: this.difficulty,
    travelStyle: this.travelStyle,
    parentItinerary: this._id,
    status: 'draft',
    version: 1
  };
  
  return mongoose.model('Itinerary').create(clonedData);
};

ItinerarySchema.methods.addLike = function(userId) {
  if (!this.likedBy.includes(userId)) {
    this.likedBy.push(userId);
    this.likes += 1;
  }
  return this.save();
};

ItinerarySchema.methods.removeLike = function(userId) {
  const index = this.likedBy.indexOf(userId);
  if (index > -1) {
    this.likedBy.splice(index, 1);
    this.likes -= 1;
  }
  return this.save();
};

ItinerarySchema.methods.addBookmark = function(userId) {
  if (!this.bookmarkedBy.includes(userId)) {
    this.bookmarkedBy.push(userId);
    this.bookmarks += 1;
  }
  return this.save();
};

ItinerarySchema.methods.removeBookmark = function(userId) {
  const index = this.bookmarkedBy.indexOf(userId);
  if (index > -1) {
    this.bookmarkedBy.splice(index, 1);
    this.bookmarks -= 1;
  }
  return this.save();
};

ItinerarySchema.methods.incrementView = function() {
  this.views += 1;
  this.lastAccessedAt = new Date();
  return this.save();
};

// Static methods
ItinerarySchema.statics.getPopularItineraries = function(limit = 10) {
  return this.find({ isPublic: true, status: { $ne: 'draft' } })
    .sort({ likes: -1, views: -1 })
    .limit(limit)
    .populate('owner', 'fullName profilePic location');
};

ItinerarySchema.statics.searchPublicItineraries = function(query, filters = {}) {
  const searchQuery = { isPublic: true, status: { $ne: 'draft' } };
  
  if (query) {
    searchQuery.$text = { $search: query };
  }
  
  if (filters.tags && filters.tags.length > 0) {
    searchQuery.tags = { $in: filters.tags };
  }
  
  if (filters.difficulty) {
    searchQuery.difficulty = filters.difficulty;
  }
  
  if (filters.travelStyle) {
    searchQuery.travelStyle = filters.travelStyle;
  }
  
  if (filters.minDuration || filters.maxDuration) {
    searchQuery.duration = {};
    // Add duration filtering logic here
  }
  
  return this.find(searchQuery)
    .populate('owner', 'fullName profilePic location')
    .sort({ likes: -1, createdAt: -1 });
};

ItinerarySchema.statics.getItinerariesByCity = function(city, isPublic = true) {
  const query = { 'stops.city': new RegExp(city, 'i') };
  if (isPublic) query.isPublic = true;
  
  return this.find(query)
    .populate('owner', 'fullName profilePic location')
    .sort({ likes: -1 });
};

// Don't include sensitive data in JSON
ItinerarySchema.methods.toJSON = function() {
  const itinerary = this.toObject({ virtuals: true });
  
  // Remove sensitive data for non-owners
  if (this.populated('owner') && this.owner._id) {
    // Keep full data for owner, limited for others
  }
  
  return itinerary;
};

module.exports = mongoose.model('Itinerary', ItinerarySchema);
