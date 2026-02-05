import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBell, FaTimes } from 'react-icons/fa';
import api from '../utils/api';
import { getSocket } from '../utils/socket';
import { formatDistanceToNow } from '../utils/dateUtils';

const NotificationDropdown = ({ onClose, onUpdateCount }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();

        // Listen for real-time notifications
        const socket = getSocket();
        if (socket) {
            socket.on('notification', (notification) => {
                setNotifications((prev) => [notification, ...prev]);
                onUpdateCount((prev) => prev + 1);
            });
        }

        // Close dropdown when clicking outside
        const handleClickOutside = (e) => {
            if (!e.target.closest('.notification-dropdown')) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            if (socket) {
                socket.off('notification');
            }
        };
    }, [onClose, onUpdateCount]);

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications?limit=10');
            setNotifications(response.data.notifications);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await api.put(`/notifications/${notificationId}/read`);
            setNotifications((prev) =>
                prev.map((notif) =>
                    notif._id === notificationId ? { ...notif, read: true } : notif
                )
            );
            onUpdateCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all/bulk');
            setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
            onUpdateCount(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    return (
        <div className="notification-dropdown absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto animate-fade-in">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                <div className="flex items-center space-x-2">
                    {notifications.some((n) => !n.read) && (
                        <button
                            onClick={markAllAsRead}
                            className="text-xs text-primary-600 hover:text-primary-700"
                        >
                            Mark all read
                        </button>
                    )}
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <FaTimes />
                    </button>
                </div>
            </div>

            {/* Notifications List */}
            <div className="divide-y divide-gray-100">
                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="spinner border-primary-600"></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                        <FaBell className="text-4xl mb-2 text-gray-300" />
                        <p>No notifications yet</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification._id}
                            className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50' : ''
                                }`}
                            onClick={() => !notification.read && markAsRead(notification._id)}
                        >
                            <div className="flex items-start space-x-3">
                                {notification.sender?.profilePicture ? (
                                    <img
                                        src={notification.sender.profilePicture}
                                        alt={notification.sender.username}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-semibold">
                                            {notification.sender?.username?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-900">
                                        <Link
                                            to={`/profile/${notification.sender?._id}`}
                                            className="font-semibold hover:underline"
                                        >
                                            {notification.sender?.username}
                                        </Link>{' '}
                                        {notification.type === 'follow' && 'started following you'}
                                        {notification.type === 'like' && 'liked your post'}
                                        {notification.type === 'comment' && 'commented on your post'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formatDistanceToNow(notification.createdAt)}
                                    </p>
                                </div>

                                {!notification.read && (
                                    <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0"></div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationDropdown;
