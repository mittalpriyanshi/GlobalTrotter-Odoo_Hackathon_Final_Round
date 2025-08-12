const mongoose = require('mongoose');

const JournalEntrySchema = new mongoose.Schema({
  // Basic information
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', index: true }, // Optional - can be personal entry
  
  // Entry content
  title: { type: String, required: true },
  content: { type: String, required: true },
  
  // Entry metadata
  date: Date, // Date the entry represents (not created date)
  location: String,
  mood: {
    type: String,
    enum: ['excited', 'happy', 'content', 'tired', 'amazed', 'peaceful', 'adventurous', 'nostalgic']
  },
  weather: {
    type: String,
    enum: [
      'Sunny ☀️', 'Cloudy ☁️', 'Rainy 🌧️', 'Snowy ❄️', 
      'Windy 💨', 'Stormy ⛈️', 'Foggy 🌫️', 'Hot 🔥', 'Cold 🥶'
    ]
  },
  
  // Additional content
  highlights: [String], // Array of highlight strings
  photos: [{
    url: String,
    caption: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Entry properties
  isPublic: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
  tags: [String],
  
  // Social features for public entries
  likes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    createdAt: { type: Date, default: Date.now }
  }],
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  
  // Activity tracking
  readingTime: { type: Number, default: 0 }, // Estimated reading time in minutes
  wordCount: { type: Number, default: 0 },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for performance
JournalEntrySchema.index({ owner: 1, createdAt: -1 });
JournalEntrySchema.index({ trip: 1, date: -1 });
JournalEntrySchema.index({ title: 'text', content: 'text', location: 'text' });
JournalEntrySchema.index({ date: -1 });
JournalEntrySchema.index({ isPublic: 1, likes: -1 });
JournalEntrySchema.index({ tags: 1 });
JournalEntrySchema.index({ mood: 1 });

// Pre-save middleware
JournalEntrySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Calculate word count and estimated reading time
  if (this.content) {
    const words = this.content.trim().split(/\s+/).length;
    this.wordCount = words;
    // Average reading speed is 200-250 words per minute, using 225
    this.readingTime = Math.ceil(words / 225);
  }
  
  next();
});

// Virtual for formatted date
JournalEntrySchema.virtual('formattedDate').get(function() {
  if (!this.date) return null;
  return this.date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for mood display
JournalEntrySchema.virtual('moodDisplay').get(function() {
  const moodEmojis = {
    excited: '😄 Excited',
    happy: '😊 Happy',
    content: '😌 Content',
    tired: '😴 Tired',
    amazed: '🤩 Amazed',
    peaceful: '😇 Peaceful',
    adventurous: '🤠 Adventurous',
    nostalgic: '🥺 Nostalgic'
  };
  return this.mood ? moodEmojis[this.mood] : null;
});

// Virtual for content preview
JournalEntrySchema.virtual('contentPreview').get(function() {
  if (!this.content) return '';
  const maxLength = 150;
  return this.content.length > maxLength 
    ? this.content.substring(0, maxLength) + '...'
    : this.content;
});

// Instance methods
JournalEntrySchema.methods.addPhoto = function(photoData) {
  this.photos.push({
    url: photoData.url,
    caption: photoData.caption || '',
    uploadedAt: new Date()
  });
  return this.save();
};

JournalEntrySchema.methods.removePhoto = function(photoIndex) {
  if (photoIndex >= 0 && photoIndex < this.photos.length) {
    this.photos.splice(photoIndex, 1);
    return this.save();
  }
  throw new Error('Invalid photo index');
};

JournalEntrySchema.methods.addHighlight = function(highlight) {
  if (highlight && highlight.trim()) {
    this.highlights.push(highlight.trim());
    return this.save();
  }
  throw new Error('Highlight cannot be empty');
};

JournalEntrySchema.methods.removeHighlight = function(highlightIndex) {
  if (highlightIndex >= 0 && highlightIndex < this.highlights.length) {
    this.highlights.splice(highlightIndex, 1);
    return this.save();
  }
  throw new Error('Invalid highlight index');
};

JournalEntrySchema.methods.addLike = function(userId) {
  if (!this.likedBy.includes(userId)) {
    this.likedBy.push(userId);
    this.likes += 1;
  }
  return this.save();
};

JournalEntrySchema.methods.removeLike = function(userId) {
  const index = this.likedBy.indexOf(userId);
  if (index > -1) {
    this.likedBy.splice(index, 1);
    this.likes -= 1;
  }
  return this.save();
};

JournalEntrySchema.methods.addComment = function(userId, content) {
  this.comments.push({
    user: userId,
    content: content.trim(),
    createdAt: new Date()
  });
  return this.save();
};

JournalEntrySchema.methods.removeComment = function(commentId) {
  this.comments = this.comments.filter(comment => 
    comment._id.toString() !== commentId.toString());
  return this.save();
};

JournalEntrySchema.methods.incrementView = function() {
  this.views += 1;
  return this.save();
};

JournalEntrySchema.methods.clone = function(newOwner, newTitle) {
  const clonedData = {
    owner: newOwner,
    title: newTitle || `${this.title} (Copy)`,
    content: this.content,
    date: this.date,
    location: this.location,
    mood: this.mood,
    weather: this.weather,
    highlights: [...this.highlights],
    tags: [...this.tags],
    isPublic: false,
    isPinned: false
  };
  
  return mongoose.model('JournalEntry').create(clonedData);
};

// Static methods
JournalEntrySchema.statics.getEntriesByTrip = function(userId, tripId) {
  return this.find({ owner: userId, trip: tripId })
    .sort({ date: -1, createdAt: -1 });
};

JournalEntrySchema.statics.getRecentEntries = function(userId, limit = 10) {
  return this.find({ owner: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('trip', 'tripName place');
};

JournalEntrySchema.statics.getEntriesByMood = function(userId, mood) {
  return this.find({ owner: userId, mood })
    .sort({ date: -1, createdAt: -1 })
    .populate('trip', 'tripName place');
};

JournalEntrySchema.statics.getEntriesByDateRange = function(userId, startDate, endDate) {
  const query = { owner: userId };
  
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }
  
  return this.find(query)
    .sort({ date: -1, createdAt: -1 })
    .populate('trip', 'tripName place');
};

JournalEntrySchema.statics.searchEntries = function(userId, searchQuery) {
  return this.find({
    owner: userId,
    $text: { $search: searchQuery }
  })
  .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
  .populate('trip', 'tripName place');
};

JournalEntrySchema.statics.getPublicEntries = function(filters = {}) {
  const query = { isPublic: true };
  
  if (filters.mood) query.mood = filters.mood;
  if (filters.location) query.location = new RegExp(filters.location, 'i');
  if (filters.tags && filters.tags.length > 0) query.tags = { $in: filters.tags };
  
  return this.find(query)
    .populate('owner', 'fullName profilePic location')
    .populate('trip', 'tripName place')
    .sort({ likes: -1, createdAt: -1 });
};

JournalEntrySchema.statics.getEntryStatistics = function(userId) {
  return this.aggregate([
    { $match: { owner: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalEntries: { $sum: 1 },
        totalWords: { $sum: '$wordCount' },
        avgReadingTime: { $avg: '$readingTime' },
        moodBreakdown: {
          $push: '$mood'
        },
        entriesWithPhotos: {
          $sum: { $cond: [{ $gt: [{ $size: '$photos' }, 0] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalEntries: 1,
        totalWords: 1,
        avgReadingTime: { $round: ['$avgReadingTime', 1] },
        entriesWithPhotos: 1,
        moodBreakdown: 1
      }
    }
  ]);
};

JournalEntrySchema.statics.getLocationStats = function(userId) {
  return this.aggregate([
    { 
      $match: { 
        owner: mongoose.Types.ObjectId(userId),
        location: { $ne: null, $ne: '' }
      }
    },
    {
      $group: {
        _id: '$location',
        count: { $sum: 1 },
        lastEntry: { $max: '$date' }
      }
    },
    {
      $project: {
        _id: 0,
        location: '$_id',
        count: 1,
        lastEntry: 1
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
};

// Don't include sensitive data in JSON
JournalEntrySchema.methods.toJSON = function() {
  const entry = this.toObject({ virtuals: true });
  
  // Remove sensitive data for non-owners viewing public entries
  if (!this.populated('owner') || !this.owner._id) {
    // Keep full data for owner, limited for others
  }
  
  return entry;
};

module.exports = mongoose.model('JournalEntry', JournalEntrySchema);
