import { useState } from 'react';
import { Bell, X, CheckCheck, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { formatDate } from '../../utils/helpers';
import clsx from 'clsx';

const RealTimeNotifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const getIcon = (variant) => {
    switch (variant) {
      case 'success':
        return <CheckCircle size={16} className="text-success-600" />;
      case 'danger':
        return <X size={16} className="text-danger-600" />;
      case 'warning':
        return <AlertCircle size={16} className="text-warning-600" />;
      default:
        return <Info size={16} className="text-primary-600" />;
    }
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-danger-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-20 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-primary-600" />
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary-600 hover:underline flex items-center gap-1"
                >
                  <CheckCheck size={12} />
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <Bell size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500 text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => !notification.is_read && markAsRead(notification.id)}
                    className={clsx(
                      'px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors',
                      !notification.is_read && 'bg-primary-50 border-l-4 border-l-primary-500'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getIcon(notification.variant)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={clsx(
                          'text-sm',
                          !notification.is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
                        )}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(notification.created_at, 'MMM dd, HH:mm')}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-primary-500 rounded-full mt-1 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RealTimeNotifications;