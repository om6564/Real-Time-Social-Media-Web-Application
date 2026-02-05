import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard';
import api from '../utils/api';
import { FaEdit, FaUserPlus, FaUserMinus, FaUsers } from 'react-icons/fa';

const Profile = () => {
    const { userId } = useParams();
    const { user: currentUser, updateUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ bio: '', profilePicture: '' });
    const [isFollowing, setIsFollowing] = useState(false);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);

    const isOwnProfile = currentUser?.id === userId;

    useEffect(() => {
        fetchProfile();
        fetchUserPosts();
    }, [userId]);

    const fetchProfile = async () => {
        try {
            const response = await api.get(`/users/profile/${userId}`);
            setProfile(response.data);
            setEditData({
                bio: response.data.bio || '',
                profilePicture: response.data.profilePicture || '',
            });
            setIsFollowing(response.data.followers?.some((f) => f._id === currentUser?.id));
            setFollowersCount(response.data.followers?.length || 0);
            setFollowingCount(response.data.following?.length || 0);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setLoading(false);
        }
    };

    const fetchUserPosts = async () => {
        try {
            const response = await api.get(`/posts/user/${userId}`);
            setPosts(response.data.posts);
        } catch (error) {
            console.error('Error fetching user posts:', error);
        }
    };

    const handleFollow = async () => {
        try {
            if (isFollowing) {
                await api.post(`/users/unfollow/${userId}`);
                setIsFollowing(false);
                setFollowersCount((prev) => prev - 1);
            } else {
                await api.post(`/users/follow/${userId}`);
                setIsFollowing(true);
                setFollowersCount((prev) => prev + 1);
            }
        } catch (error) {
            console.error('Error following/unfollowing:', error);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditData((prev) => ({ ...prev, profilePicture: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfile = async () => {
        try {
            const response = await api.put('/users/profile', editData);
            setProfile(response.data.user);
            updateUser(response.data.user);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const handlePostDeleted = (postId) => {
        setPosts((prev) => prev.filter((p) => p._id !== postId));
    };

    const handlePostUpdated = (updatedPost) => {
        setPosts((prev) =>
            prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="spinner border-primary-600"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12 text-center">
                <h2 className="text-2xl font-bold text-gray-900">User not found</h2>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-6">
            {/* Profile Header */}
            <div className="card mb-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                    {/* Profile Picture */}
                    <div className="relative">
                        {isEditing ? (
                            <label className="cursor-pointer">
                                {editData.profilePicture ? (
                                    <img
                                        src={editData.profilePicture}
                                        alt={profile.username}
                                        className="w-32 h-32 rounded-full object-cover border-4 border-primary-600"
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-full bg-primary-600 flex items-center justify-center border-4 border-primary-600">
                                        <span className="text-white font-bold text-4xl">
                                            {profile.username?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                                <div className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-2">
                                    <FaEdit />
                                </div>
                            </label>
                        ) : profile.profilePicture ? (
                            <img
                                src={profile.profilePicture}
                                alt={profile.username}
                                className="w-32 h-32 rounded-full object-cover border-4 border-primary-600"
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-full bg-primary-600 flex items-center justify-center border-4 border-primary-600">
                                <span className="text-white font-bold text-4xl">
                                    {profile.username?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1 text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                            <h1 className="text-3xl font-bold text-gray-900">{profile.username}</h1>

                            {isOwnProfile ? (
                                <button
                                    onClick={() => (isEditing ? handleSaveProfile() : setIsEditing(true))}
                                    className="btn-primary mt-2 sm:mt-0"
                                >
                                    {isEditing ? 'Save Profile' : 'Edit Profile'}
                                </button>
                            ) : (
                                <button
                                    onClick={handleFollow}
                                    className={`mt-2 sm:mt-0 ${isFollowing ? 'btn-secondary' : 'btn-primary'
                                        }`}
                                >
                                    {isFollowing ? (
                                        <>
                                            <FaUserMinus className="inline mr-2" />
                                            Unfollow
                                        </>
                                    ) : (
                                        <>
                                            <FaUserPlus className="inline mr-2" />
                                            Follow
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="flex justify-center sm:justify-start space-x-6 mb-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
                                <p className="text-sm text-gray-500">Posts</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-900">{followersCount}</p>
                                <p className="text-sm text-gray-500">Followers</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-900">{followingCount}</p>
                                <p className="text-sm text-gray-500">Following</p>
                            </div>
                        </div>

                        {/* Bio */}
                        {isEditing ? (
                            <textarea
                                value={editData.bio}
                                onChange={(e) => setEditData((prev) => ({ ...prev, bio: e.target.value }))}
                                placeholder="Write a bio..."
                                className="input-field w-full"
                                rows="3"
                            />
                        ) : (
                            <p className="text-gray-700">{profile.bio || 'No bio yet'}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* User Posts */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                    <FaUsers className="mr-2" />
                    Posts
                </h2>

                {posts.length === 0 ? (
                    <div className="card text-center py-12">
                        <p className="text-gray-500">No posts yet</p>
                    </div>
                ) : (
                    posts.map((post) => (
                        <PostCard
                            key={post._id}
                            post={post}
                            onDelete={handlePostDeleted}
                            onUpdate={handlePostUpdated}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default Profile;
