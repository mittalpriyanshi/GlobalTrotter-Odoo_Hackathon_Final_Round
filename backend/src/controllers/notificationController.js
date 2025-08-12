const Notification = require('../models/Notification');

// Get user's notifications
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      type,
      category,
      isRead,
      limit = 20,
      page = 1,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { recipient: userId, isArchived: false };
    
    if (type) query.type = type;
    if (category) query.category = category;
    if (isRead !== undefined) query.isRead = isRead === 'true';

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const notifications = await Notification.find(query)
      .populate('relatedUser', 'fullName profilePic')
      .populate('relatedTrip', 'tripName place')
      .populate('relatedItinerary', 'name')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalCount = await Notification.countDocuments(query);
    const unreadCount = await Notification.getUnreadCount(userId);

    res.json({
      success: true,
      notifications,
      unreadCount,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching notifications'
    });
  }
};

// Get notification by ID
exports.getNotificationById = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId
    })
    .populate('relatedUser', 'fullName profilePic')
    .populate('relatedTrip', 'tripName place')
    .populate('relatedItinerary', 'name');

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      notification
    });
  } catch (err) {
    console.error('Get notification error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching notification'
    });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.markAsRead();

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (err) {
    console.error('Mark as read error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error marking notification as read'
    });
  }
};

// Mark notification as unread
exports.markAsUnread = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.markAsUnread();

    res.json({
      success: true,
      message: 'Notification marked as unread'
    });
  } catch (err) {
    console.error('Mark as unread error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error marking notification as unread'
    });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.markAllAsRead(userId);

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (err) {
    console.error('Mark all as read error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error marking all notifications as read'
    });
  }
};

// Archive notification
exports.archiveNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.archive();

    res.json({
      success: true,
      message: 'Notification archived'
    });
  } catch (err) {
    console.error('Archive notification error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error archiving notification'
    });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (err) {
    console.error('Delete notification error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error deleting notification'
    });
  }
};

// Get notification settings
exports.getNotificationSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = req.user; // From auth middleware

    const settings = user.preferences?.notifications || {
      email: true,
      push: true,
      tripReminders: true,
      budgetAlerts: true
    };

    res.json({
      success: true,
      settings
    });
  } catch (err) {
    console.error('Get notification settings error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching notification settings'
    });
  }
};

// Update notification settings
exports.updateNotificationSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { email, push, tripReminders, budgetAlerts } = req.body;

    const User = require('../models/User');
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update notification preferences
    if (!user.preferences) user.preferences = {};
    if (!user.preferences.notifications) user.preferences.notifications = {};

    if (email !== undefined) user.preferences.notifications.email = email;
    if (push !== undefined) user.preferences.notifications.push = push;
    if (tripReminders !== undefined) user.preferences.notifications.tripReminders = tripReminders;
    if (budgetAlerts !== undefined) user.preferences.notifications.budgetAlerts = budgetAlerts;

    await user.save();

    res.json({
      success: true,
      message: 'Notification settings updated',
      settings: user.preferences.notifications
    });
  } catch (err) {
    console.error('Update notification settings error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error updating notification settings'
    });
  }
};

// Get notification statistics
exports.getNotificationStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Notification.aggregate([
      { $match: { recipient: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          unreadCount: {
            $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          type: '$_id',
          count: 1,
          unreadCount: 1
        }
      }
    ]);

    const totalCount = await Notification.countDocuments({ recipient: userId });
    const unreadCount = await Notification.getUnreadCount(userId);

    res.json({
      success: true,
      statistics: {
        total: totalCount,
        unread: unreadCount,
        byType: stats
      }
    });
  } catch (err) {
    console.error('Get notification stats error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching notification statistics'
    });
  }
};

// Create custom notification (admin/system use)
exports.createNotification = async (req, res) => {
  try {
    const {
      recipientId,
      title,
      message,
      type = 'system',
      category = 'system',
      priority = 'medium',
      actionUrl,
      channels = { inApp: true },
      scheduleFor
    } = req.body;

    // Validation
    if (!recipientId || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Recipient, title, and message are required'
      });
    }

    const notificationData = {
      recipient: recipientId,
      title,
      message,
      type,
      category,
      priority,
      actionUrl,
      channels
    };

    let notification;
    if (scheduleFor) {
      notification = await Notification.scheduleNotification(notificationData, scheduleFor);
    } else {
      notification = await Notification.create(notificationData);
    }

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      notification
    });
  } catch (err) {
    console.error('Create notification error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error creating notification'
    });
  }
};

// Get recent notifications (for dashboard)
exports.getRecentNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 5 } = req.query;

    const notifications = await Notification.getRecentNotifications(userId, parseInt(limit));

    res.json({
      success: true,
      notifications
    });
  } catch (err) {
    console.error('Get recent notifications error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching recent notifications'
    });
  }
};
