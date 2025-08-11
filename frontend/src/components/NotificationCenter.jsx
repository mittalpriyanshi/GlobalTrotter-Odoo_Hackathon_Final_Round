import { useState, useEffect } from "react";
import { BellIcon, XIcon, CalendarIcon, DollarSignIcon, MapPinIcon, CheckIcon } from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";

const NotificationCenter = () => {
  const { authUser } = useAuthUser();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (authUser) {
      generateNotifications();
    }
  }, [authUser]);

  const generateNotifications = () => {
    const trips = JSON.parse(localStorage.getItem("gt_trips") || "[]");
    const expenses = JSON.parse(localStorage.getItem("gt_expenses") || "[]");
    const existingNotifications = JSON.parse(localStorage.getItem("gt_notifications") || "[]");
    
    const newNotifications = [];
    const today = new Date();
    const oneWeekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Trip reminder notifications
    trips.forEach(trip => {
      if (trip.startDate) {
        const tripDate = new Date(trip.startDate);
        const daysUntilTrip = Math.ceil((tripDate - today) / (1000 * 60 * 60 * 24));
        
        if (daysUntilTrip === 7) {
          newNotifications.push({
            id: `trip-reminder-${trip.id}`,
            type: "trip-reminder",
            title: "Trip Coming Up!",
            message: `Your trip "${trip.tripName}" to ${trip.place} starts in 1 week`,
            icon: CalendarIcon,
            timestamp: new Date().toISOString(),
            read: false,
            actionUrl: "/trips"
          });
        } else if (daysUntilTrip === 1) {
          newNotifications.push({
            id: `trip-tomorrow-${trip.id}`,
            type: "trip-tomorrow",
            title: "Trip Tomorrow!",
            message: `Don't forget - your trip "${trip.tripName}" starts tomorrow!`,
            icon: CalendarIcon,
            timestamp: new Date().toISOString(),
            read: false,
            actionUrl: "/trips"
          });
        }
      }
    });

    // Budget alert notifications
    const budgets = JSON.parse(localStorage.getItem("gt_budgets") || "[]");
    budgets.forEach(budget => {
      const tripExpenses = expenses.filter(expense => 
        expense.tripId === budget.tripId && expense.category === budget.category
      );
      const totalSpent = tripExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const percentageSpent = (totalSpent / budget.amount) * 100;

      if (percentageSpent >= 80 && percentageSpent < 100) {
        newNotifications.push({
          id: `budget-warning-${budget.id}`,
          type: "budget-warning",
          title: "Budget Alert",
          message: `You've spent ${percentageSpent.toFixed(0)}% of your ${budget.category} budget`,
          icon: DollarSignIcon,
          timestamp: new Date().toISOString(),
          read: false,
          actionUrl: "/expenses"
        });
      } else if (percentageSpent >= 100) {
        newNotifications.push({
          id: `budget-exceeded-${budget.id}`,
          type: "budget-exceeded",
          title: "Budget Exceeded!",
          message: `You've exceeded your ${budget.category} budget by ${(percentageSpent - 100).toFixed(0)}%`,
          icon: DollarSignIcon,
          timestamp: new Date().toISOString(),
          read: false,
          actionUrl: "/expenses"
        });
      }
    });

    // Weather reminder notifications
    trips.forEach(trip => {
      if (trip.startDate) {
        const tripDate = new Date(trip.startDate);
        const daysUntilTrip = Math.ceil((tripDate - today) / (1000 * 60 * 60 * 24));
        
        if (daysUntilTrip === 3) {
          newNotifications.push({
            id: `weather-check-${trip.id}`,
            type: "weather-reminder",
            title: "Check the Weather",
            message: `Don't forget to check the weather for ${trip.place} before your trip!`,
            icon: MapPinIcon,
            timestamp: new Date().toISOString(),
            read: false,
            actionUrl: "/trips"
          });
        }
      }
    });

    // Filter out notifications that already exist
    const filteredNotifications = newNotifications.filter(newNotif => 
      !existingNotifications.some(existing => existing.id === newNotif.id)
    );

    if (filteredNotifications.length > 0) {
      const allNotifications = [...filteredNotifications, ...existingNotifications]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 50); // Keep only the latest 50 notifications

      localStorage.setItem("gt_notifications", JSON.stringify(allNotifications));
      setNotifications(allNotifications);
    } else {
      setNotifications(existingNotifications);
    }

    // Update unread count
    const unread = [...filteredNotifications, ...existingNotifications].filter(n => !n.read).length;
    setUnreadCount(unread);
  };

  const markAsRead = (notificationId) => {
    const updatedNotifications = notifications.map(notif => 
      notif.id === notificationId ? { ...notif, read: true } : notif
    );
    localStorage.setItem("gt_notifications", JSON.stringify(updatedNotifications));
    setNotifications(updatedNotifications);
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notif => ({ ...notif, read: true }));
    localStorage.setItem("gt_notifications", JSON.stringify(updatedNotifications));
    setNotifications(updatedNotifications);
    setUnreadCount(0);
  };

  const deleteNotification = (notificationId) => {
    const updatedNotifications = notifications.filter(notif => notif.id !== notificationId);
    localStorage.setItem("gt_notifications", JSON.stringify(updatedNotifications));
    setNotifications(updatedNotifications);
    
    const deletedNotif = notifications.find(n => n.id === notificationId);
    if (deletedNotif && !deletedNotif.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "trip-reminder":
      case "trip-tomorrow":
        return "alert-info";
      case "budget-warning":
        return "alert-warning";
      case "budget-exceeded":
        return "alert-error";
      case "weather-reminder":
        return "alert-success";
      default:
        return "alert-info";
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return `${Math.floor(diffInHours / 24)}d ago`;
    }
  };

  if (!authUser) return null;

  return (
    <div className="dropdown dropdown-end">
      <label
        tabIndex={0}
        className="btn btn-ghost btn-circle"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="indicator">
          <BellIcon className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="badge badge-primary badge-sm indicator-item">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </label>

      {isOpen && (
        <div className="dropdown-content mt-3 z-[1] card card-compact w-96 p-2 shadow bg-base-100 border border-primary/20">
          <div className="card-body p-0">
            <div className="flex items-center justify-between p-4 border-b border-base-300">
              <h3 className="font-bold text-lg">Notifications</h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="btn btn-ghost btn-xs"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="btn btn-ghost btn-circle btn-xs"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                <div className="space-y-2 p-2">
                  {notifications.slice(0, 10).map((notification) => {
                    const IconComponent = notification.icon;
                    return (
                      <div
                        key={notification.id}
                        className={`alert ${getNotificationColor(notification.type)} ${
                          notification.read ? "opacity-60" : ""
                        } p-3`}
                      >
                        <IconComponent className="w-5 h-5" />
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {notification.title}
                          </div>
                          <div className="text-xs opacity-80">
                            {notification.message}
                          </div>
                          <div className="text-xs opacity-60 mt-1">
                            {formatTimestamp(notification.timestamp)}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {!notification.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="btn btn-ghost btn-xs"
                              title="Mark as read"
                            >
                              <CheckIcon className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="btn btn-ghost btn-xs text-error"
                            title="Delete"
                          >
                            <XIcon className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BellIcon className="w-12 h-12 mx-auto opacity-30 mb-4" />
                  <p className="text-sm opacity-70">No notifications yet</p>
                </div>
              )}
            </div>

            {notifications.length > 10 && (
              <div className="p-4 border-t border-base-300 text-center">
                <button className="btn btn-ghost btn-sm">
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;

