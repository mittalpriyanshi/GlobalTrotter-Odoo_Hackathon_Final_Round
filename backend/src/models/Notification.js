const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  // Target user
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  
  // Notification content
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: [
      'trip_reminder',      // Trip starting soon
      'budget_alert',       // Budget threshold reached
      'budget_exceeded',    // Budget exceeded
      'itinerary_shared',   // Someone shared an itinerary
      'trip_shared',        // Someone shared a trip
      'journal_comment',    // Comment on journal entry
      'journal_like',       // Like on journal entry
      'friend_request',     // Friend request (if implemented)
      'system',             // System notifications
      'promotion',          // Promotional content
      'achievement',        // User achievements
      'booking_reminder',   // Booking deadline reminder
      'weather_alert',      // Weather updates for trips
      'expense_reminder'    // Reminder to add expenses
    ]
  },
  
  // Related entities
  relatedTrip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
  relatedItinerary: { type: mongoose.Schema.Types.ObjectId, ref: 'Itinerary' },
  relatedJournalEntry: { type: mongoose.Schema.Types.ObjectId, ref: 'JournalEntry' },
  relatedExpense: { type: mongoose.Schema.Types.ObjectId, ref: 'Expense' },
  relatedBudget: { type: mongoose.Schema.Types.ObjectId, ref: 'Budget' },
  relatedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // User who triggered the notification
  
  // Notification properties
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['trip', 'budget', 'social', 'system', 'reminder'],
    default: 'system'
  },
  
  // Actions and data
  actionUrl: String, // URL to navigate to when notification is clicked
  actionData: mongoose.Schema.Types.Mixed, // Additional data for the notification
  imageUrl: String, // Optional image for the notification
  
  // Status
  isRead: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
  readAt: Date,
  
  // Delivery settings
  channels: {
    inApp: { type: Boolean, default: true },
    email: { type: Boolean, default: false },
    push: { type: Boolean, default: false }
  },
  
  // Delivery tracking
  deliveryStatus: {
    inApp: { 
      sent: { type: Boolean, default: false },
      sentAt: Date,
      acknowledged: { type: Boolean, default: false },
      acknowledgedAt: Date
    },
    email: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      opened: { type: Boolean, default: false },
      openedAt: Date
    },
    push: {
      sent: { type: Boolean, default: false },
      sentAt: Date,
      clicked: { type: Boolean, default: false },
      clickedAt: Date
    }
  },
  
  // Scheduling
  scheduleFor: Date, // When to send the notification (for reminders)
  isScheduled: { type: Boolean, default: false },
  
  // Expiration
  expiresAt: Date,
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for performance
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, isRead: 1 });
NotificationSchema.index({ recipient: 1, type: 1 });
NotificationSchema.index({ isScheduled: 1, scheduleFor: 1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired notifications
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 }); // Auto-delete after 90 days

// Pre-save middleware
NotificationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Mark as delivered in-app by default
  if (this.channels.inApp && !this.deliveryStatus.inApp.sent) {
    this.deliveryStatus.inApp.sent = true;
    this.deliveryStatus.inApp.sentAt = new Date();
  }
  
  next();
});

// Virtual for time ago
NotificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffMs = now - this.createdAt;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return this.createdAt.toLocaleDateString();
});

// Instance methods
NotificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  this.deliveryStatus.inApp.acknowledged = true;
  this.deliveryStatus.inApp.acknowledgedAt = new Date();
  return this.save();
};

NotificationSchema.methods.markAsUnread = function() {
  this.isRead = false;
  this.readAt = null;
  this.deliveryStatus.inApp.acknowledged = false;
  this.deliveryStatus.inApp.acknowledgedAt = null;
  return this.save();
};

NotificationSchema.methods.archive = function() {
  this.isArchived = true;
  return this.save();
};

NotificationSchema.methods.unarchive = function() {
  this.isArchived = false;
  return this.save();
};

NotificationSchema.methods.markEmailOpened = function() {
  this.deliveryStatus.email.opened = true;
  this.deliveryStatus.email.openedAt = new Date();
  return this.save();
};

NotificationSchema.methods.markPushClicked = function() {
  this.deliveryStatus.push.clicked = true;
  this.deliveryStatus.push.clickedAt = new Date();
  return this.save();
};

// Static methods for creating specific notification types
NotificationSchema.statics.createTripReminder = function(recipientId, trip, daysUntilTrip) {
  return this.create({
    recipient: recipientId,
    title: `Trip Starting Soon!`,
    message: `Your trip to ${trip.place} starts in ${daysUntilTrip} ${daysUntilTrip === 1 ? 'day' : 'days'}`,
    type: 'trip_reminder',
    category: 'trip',
    priority: daysUntilTrip <= 1 ? 'high' : 'medium',
    relatedTrip: trip._id,
    actionUrl: `/trips/${trip._id}`,
    channels: { inApp: true, email: true },
    expiresAt: new Date(trip.startDate)
  });
};

NotificationSchema.statics.createBudgetAlert = function(recipientId, budget, expense, percentageUsed) {
  const isExceeded = percentageUsed > 100;
  return this.create({
    recipient: recipientId,
    title: isExceeded ? 'Budget Exceeded!' : 'Budget Alert',
    message: isExceeded 
      ? `You've exceeded your ${budget.category} budget by ${(percentageUsed - 100).toFixed(1)}%`
      : `You've used ${percentageUsed.toFixed(1)}% of your ${budget.category} budget`,
    type: isExceeded ? 'budget_exceeded' : 'budget_alert',
    category: 'budget',
    priority: isExceeded ? 'high' : 'medium',
    relatedBudget: budget._id,
    relatedExpense: expense._id,
    relatedTrip: budget.trip,
    actionUrl: budget.trip ? `/trips/${budget.trip}/expenses` : '/expenses',
    channels: { inApp: true, email: true }
  });
};

NotificationSchema.statics.createShareNotification = function(recipientId, sharedById, sharedItem, itemType) {
  return this.create({
    recipient: recipientId,
    title: `${itemType} Shared With You`,
    message: `${sharedById.fullName} shared a ${itemType.toLowerCase()} with you`,
    type: `${itemType.toLowerCase()}_shared`,
    category: 'social',
    priority: 'medium',
    relatedUser: sharedById._id,
    ...(itemType === 'Trip' && { relatedTrip: sharedItem._id }),
    ...(itemType === 'Itinerary' && { relatedItinerary: sharedItem._id }),
    actionUrl: `/${itemType.toLowerCase()}s/${sharedItem._id}`,
    channels: { inApp: true, email: true }
  });
};

NotificationSchema.statics.createJournalInteraction = function(recipientId, interactorId, journalEntry, interactionType) {
  const isLike = interactionType === 'like';
  return this.create({
    recipient: recipientId,
    title: isLike ? 'New Like on Your Journal' : 'New Comment on Your Journal',
    message: isLike 
      ? `${interactorId.fullName} liked your journal entry "${journalEntry.title}"`
      : `${interactorId.fullName} commented on your journal entry "${journalEntry.title}"`,
    type: `journal_${interactionType}`,
    category: 'social',
    priority: 'low',
    relatedUser: interactorId._id,
    relatedJournalEntry: journalEntry._id,
    actionUrl: `/journal/${journalEntry._id}`,
    channels: { inApp: true }
  });
};

NotificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    recipient: userId,
    isRead: false,
    isArchived: false
  });
};

NotificationSchema.statics.getRecentNotifications = function(userId, limit = 10) {
  return this.find({
    recipient: userId,
    isArchived: false
  })
  .populate('relatedUser', 'fullName profilePic')
  .populate('relatedTrip', 'tripName place')
  .populate('relatedItinerary', 'name')
  .sort({ createdAt: -1 })
  .limit(limit);
};

NotificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { recipient: userId, isRead: false },
    { 
      isRead: true, 
      readAt: new Date(),
      'deliveryStatus.inApp.acknowledged': true,
      'deliveryStatus.inApp.acknowledgedAt': new Date()
    }
  );
};

NotificationSchema.statics.getNotificationsByType = function(userId, type, limit = 20) {
  return this.find({
    recipient: userId,
    type: type,
    isArchived: false
  })
  .populate('relatedUser', 'fullName profilePic')
  .populate('relatedTrip', 'tripName place')
  .sort({ createdAt: -1 })
  .limit(limit);
};

NotificationSchema.statics.scheduleNotification = function(notificationData, scheduleFor) {
  return this.create({
    ...notificationData,
    isScheduled: true,
    scheduleFor: new Date(scheduleFor)
  });
};

NotificationSchema.statics.getScheduledNotifications = function() {
  return this.find({
    isScheduled: true,
    scheduleFor: { $lte: new Date() }
  });
};

// Don't include sensitive data in JSON
NotificationSchema.methods.toJSON = function() {
  const notification = this.toObject({ virtuals: true });
  return notification;
};

module.exports = mongoose.model('Notification', NotificationSchema);
