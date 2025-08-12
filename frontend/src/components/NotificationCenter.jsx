import { useState, useEffect } from "react";
import { BellIcon, XIcon, CalendarIcon, DollarSignIcon, MapPinIcon, CheckIcon } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";
import toast from "react-hot-toast";

const NotificationCenter = () => {
  const { authUser } = useAuthUser();
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch notifications from backend
  const { data: notificationsData, isLoading, error } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotifications({ limit: 50 }),
    enabled: !!authUser,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  const notifications = notificationsData?.notifications || [];
  const unreadCount = notifications.filter(n => !n.read).length;

  // Mark single notification as read
  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    },
    onError: (error) => {
      toast.error("Failed to mark notification as read");
      console.error("Mark as read error:", error);
    }
  });

  // Mark all notifications as read
  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
      toast.success("All notifications marked as read");
    },
    onError: (error) => {
      toast.error("Failed to mark all notifications as read");
      console.error("Mark all as read error:", error);
    }
  });

  // Fallback to local notifications if backend fails
  useEffect(() => {
    if (error && authUser) {
      console.warn("Backend notifications failed, using local fallback");
      generateLocalNotifications();
    }
  }, [error, authUser]);

  // Local fallback notification generation
  const generateLocalNotifications = () => {
    console.log("Generating local notifications as fallback");
    // Simple local notifications for demo
    const localNotifications = [
      {
        id: "welcome",
        type: "info",
        title: "Welcome to GlobalTrotter!",
        message: "Start planning your next adventure by creating a trip.",
        timestamp: new Date().toISOString(),
        read: false
      }
    ];
    return localNotifications;
  };

  // Handle marking notification as read
  const handleMarkAsRead = (notificationId) => {
    if (error) {
      // Local fallback
      console.log("Marking notification as read locally:", notificationId);
      return;
    }
    markAsReadMutation.mutate(notificationId);
  };

  // Handle marking all as read
  const handleMarkAllAsRead = () => {
    if (error) {
      // Local fallback
      console.log("Marking all notifications as read locally");
      return;
    }
    markAllAsReadMutation.mutate();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "trip_reminder":
      case "trip_update":
        return CalendarIcon;
      case "budget_alert":
      case "expense_alert":
        return DollarSignIcon;
      case "weather_alert":
        return MapPinIcon;
      default:
        return BellIcon;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "trip_reminder":
      case "trip_update":
        return "alert-info";
      case "budget_alert":
        return "alert-warning";
      case "expense_alert":
        return "alert-error";
      case "weather_alert":
        return "alert-success";
      default:
        return "alert-info";
    }
  };

  const formatTimestamp = (timestamp) => {
    try {
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
    } catch (error) {
      return "Recently";
    }
  };

  if (!authUser) return null;

  return (
    <div className="dropdown dropdown-end">
      <label
        tabIndex={0}
        className="btn btn-ghost btn-circle hover:bg-primary/10"
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
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
        <div 
          className="dropdown-content mt-3 z-50 card card-compact w-96 max-w-sm p-2 shadow-xl bg-base-100 border border-primary/20 rounded-lg"
          style={{ position: 'absolute', right: 0 }}
        >
          <div className="card-body p-0">
            <div className="flex items-center justify-between p-4 border-b border-base-300">
              <h3 className="font-bold text-lg">Notifications</h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="btn btn-ghost btn-xs"
                    disabled={markAllAsReadMutation.isPending}
                  >
                    {markAllAsReadMutation.isPending ? "..." : "Mark all read"}
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
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="loading loading-spinner loading-md"></div>
                  <p className="text-sm opacity-70 mt-2">Loading notifications...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <BellIcon className="w-12 h-12 mx-auto opacity-30 mb-4" />
                  <p className="text-sm opacity-70">Unable to load notifications</p>
                  <p className="text-xs opacity-50">Using local mode</p>
                </div>
              ) : notifications.length > 0 ? (
                <div className="space-y-2 p-2">
                  {notifications.slice(0, 10).map((notification) => {
                    const IconComponent = getNotificationIcon(notification.type);
                    return (
                      <div
                        key={notification.id || notification._id}
                        className={`alert ${getNotificationColor(notification.type)} ${
                          notification.read ? "opacity-60" : ""
                        } p-3 cursor-pointer hover:bg-opacity-80`}
                      >
                        <IconComponent className="w-5 h-5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {notification.title || notification.message?.split('.')[0]}
                          </div>
                          <div className="text-xs opacity-80 line-clamp-2">
                            {notification.message}
                          </div>
                          <div className="text-xs opacity-60 mt-1">
                            {formatTimestamp(notification.createdAt || notification.timestamp)}
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          {!notification.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id || notification._id);
                              }}
                              className="btn btn-ghost btn-xs"
                              title="Mark as read"
                              disabled={markAsReadMutation.isPending}
                            >
                              <CheckIcon className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BellIcon className="w-12 h-12 mx-auto opacity-30 mb-4" />
                  <p className="text-sm opacity-70">No notifications yet</p>
                  <p className="text-xs opacity-50">Start using the app to receive updates!</p>
                </div>
              )}
            </div>

            {notifications.length > 10 && (
              <div className="p-4 border-t border-base-300 text-center">
                <button 
                  className="btn btn-ghost btn-sm"
                  onClick={() => setIsOpen(false)}
                >
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

