import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaBell, FaHome, FaCompass, FaUser, FaSignOutAlt } from 'react-icons/fa';
import NotificationDropdown from './NotificationDropdown';
import api from '../utils/api';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchUnreadCount();
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const response = await api.get('/notifications/unread-count/count');
            setUnreadCount(response.data.unreadCount);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">S</span>
                        </div>
                        <span className="text-xl font-bold text-gradient hidden sm:block">SocialApp</span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="flex items-center space-x-6">
                        <Link
                            to="/"
                            className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                        >
                            <FaHome className="text-xl" />
                            <span className="hidden sm:inline">Home</span>
                        </Link>

                        <Link
                            to="/explore"
                            className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                        >
                            <FaCompass className="text-xl" />
                            <span className="hidden sm:inline">Explore</span>
                        </Link>

                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative text-gray-700 hover:text-primary-600 transition-colors"
                            >
                                <FaBell className="text-xl" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <NotificationDropdown
                                    onClose={() => setShowNotifications(false)}
                                    onUpdateCount={setUnreadCount}
                                />
                            )}
                        </div>

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center space-x-2 focus:outline-none"
                            >
                                {user?.profilePicture ? (
                                    <img
                                        src={user.profilePicture}
                                        alt={user.username}
                                        className="w-8 h-8 rounded-full object-cover border-2 border-primary-600"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                                        <span className="text-white font-semibold text-sm">
                                            {user?.username?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </button>

                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 animate-fade-in">
                                    <Link
                                        to={`/profile/${user?.id}`}
                                        onClick={() => setShowUserMenu(false)}
                                        className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <FaUser />
                                        <span>Profile</span>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <FaSignOutAlt />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
