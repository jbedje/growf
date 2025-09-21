import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, CheckCheck, Trash2, Eye } from 'lucide-react';
import { NotificationService, type Notification, type NotificationType } from '../../services/notificationService';
import { toast } from 'react-hot-toast';

interface NotificationBellProps {
  className?: string;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  className = ""
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const response = await NotificationService.getUnreadCount();
      if (response.success) {
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du nombre de notifications non lues:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await NotificationService.getUserNotifications(1, 10);
      if (response.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.pagination.unreadCount);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await NotificationService.markAsRead(notificationId);
      if (response.success) {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === notificationId
              ? { ...notif, read: true, readAt: new Date().toISOString() }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
      toast.error('Erreur lors du marquage comme lu');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await NotificationService.markAllAsRead();
      if (response.success) {
        setNotifications(prev =>
          prev.map(notif => ({
            ...notif,
            read: true,
            readAt: new Date().toISOString()
          }))
        );
        setUnreadCount(0);
        toast.success('Toutes les notifications marquées comme lues');
      }
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error);
      toast.error('Erreur lors du marquage');
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const response = await NotificationService.deleteNotification(notificationId);
      if (response.success) {
        const wasUnread = notifications.find(n => n.id === notificationId && !n.read);
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
        if (wasUnread) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        toast.success('Notification supprimée');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    return NotificationService.getNotificationIcon(type);
  };

  const getNotificationColor = (type: NotificationType) => {
    return NotificationService.getNotificationColor(type);
  };

  const formatTime = (dateString: string) => {
    return NotificationService.formatNotificationTime(dateString);
  };

  const handleCreateTestNotification = async () => {
    try {
      const response = await NotificationService.createTestNotification();
      if (response.success) {
        toast.success('Notification de test créée');
        loadUnreadCount();
        if (isOpen) {
          loadNotifications();
        }
      }
    } catch (error) {
      console.error('Erreur lors de la création de la notification de test:', error);
      toast.error('Erreur lors de la création de la notification de test');
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800"
                    title="Tout marquer comme lu"
                  >
                    <CheckCheck className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={handleCreateTestNotification}
                  className="text-xs text-gray-500 hover:text-gray-700"
                  title="Test notification"
                >
                  <Bell className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2 text-sm">Chargement...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucune notification</p>
                <p className="text-sm text-gray-400 mt-1">
                  Vous serez notifié des nouveaux messages et documents
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${getNotificationColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center space-x-1">
                            {!notification.read && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Marquer comme lu"
                              >
                                <Eye className="h-3 w-3" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteNotification(notification.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Supprimer"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <p className={`text-sm mt-1 ${!notification.read ? 'text-gray-800' : 'text-gray-600'}`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {formatTime(notification.createdAt)}
                          </span>
                          {notification.read && notification.readAt && (
                            <Check className="h-3 w-3 text-green-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
                Voir toutes les notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;