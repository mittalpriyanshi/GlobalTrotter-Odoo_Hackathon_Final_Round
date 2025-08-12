const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getNotificationById,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  archiveNotification,
  deleteNotification,
  getNotificationSettings,
  updateNotificationSettings,
  getNotificationStats,
  createNotification,
  getRecentNotifications
} = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

// All notification routes require authentication
router.use(authMiddleware);

// Notification CRUD operations
router.get('/', getNotifications);                          // GET /api/notifications?type=...&category=...
router.get('/recent', getRecentNotifications);              // GET /api/notifications/recent?limit=5
router.get('/statistics', getNotificationStats);            // GET /api/notifications/statistics
router.get('/settings', getNotificationSettings);           // GET /api/notifications/settings
router.put('/settings', updateNotificationSettings);        // PUT /api/notifications/settings
router.post('/', createNotification);                       // POST /api/notifications (admin/system)
router.get('/:notificationId', getNotificationById);        // GET /api/notifications/:notificationId

// Notification actions
router.post('/mark-all-read', markAllAsRead);                // POST /api/notifications/mark-all-read
router.post('/:notificationId/read', markAsRead);            // POST /api/notifications/:notificationId/read
router.post('/:notificationId/unread', markAsUnread);        // POST /api/notifications/:notificationId/unread
router.post('/:notificationId/archive', archiveNotification); // POST /api/notifications/:notificationId/archive
router.delete('/:notificationId', deleteNotification);       // DELETE /api/notifications/:notificationId

module.exports = router;
