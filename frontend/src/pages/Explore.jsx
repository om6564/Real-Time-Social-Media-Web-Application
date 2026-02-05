import { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import api from '../utils/api';
import { FaSearch } from 'react-icons/fa';

const Explore = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    useEffect(() => {
        fetchLatestPosts();
    }, []);

    useEffect(() => {
        const delaySearch = setTimeout(() => {
            if (searchQuery.trim()) {
                searchUsers();
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(delaySearch);
    }, [searchQuery]);

    const fetchLatestPosts = async () => {
        try {
            const response = await api.get(`/posts/latest/all?page=${page}&limit=10`);
            const { posts: newPosts, totalPages } = response.data;

            setPosts((prev) => [...prev, ...newPosts]);
            setHasMore(page < totalPages);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching posts:', error);
            setLoading(false);
        }
    };

    const searchUsers = async () => {
        setSearching(true);
        try {
            const response = await api.get(`/users/search?q=${searchQuery}`);
            setSearchResults(response.data);
        } catch (error) {
            console.error('Error searching users:', error);
        } finally {
            setSearching(false);
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

    const loadMore = () => {
        setPage((prev) => prev + 1);
        fetchLatestPosts();
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-6">
            {/* Search Bar */}
            <div className="card mb-6">
                <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search users..."
                        className="input-field pl-10"
                    />
                </div>

                {/* Search Results */}
                {searchQuery && (
                    <div className="mt-4">
                        {searching ? (
                            <div className="flex justify-center py-4">
                                <div className="spinner border-primary-600"></div>
                            </div>
                        ) : searchResults.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No users found</p>
                        ) : (
                            <div className="space-y-3">
                                {searchResults.map((user) => (
                                    <a
                                        key={user._id}
                                        href={`/profile/${user._id}`}
                                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        {user.profilePicture ? (
                                            <img
                                                src={user.profilePicture}
                                                alt={user.username}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center">
                                                <span className="text-white font-semibold">
                                                    {user.username?.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}

                                        <div>
                                            <p className="font-semibold text-gray-900">{user.username}</p>
                                            {user.bio && <p className="text-sm text-gray-500">{user.bio}</p>}
                                        </div>
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Latest Posts */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Latest Posts</h2>

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="spinner border-primary-600"></div>
                </div>
            ) : (
                <>
                    {posts.map((post) => (
                        <PostCard
                            key={post._id}
                            post={post}
                            onDelete={handlePostDeleted}
                            onUpdate={handlePostUpdated}
                        />
                    ))}

                    {hasMore && (
                        <div className="text-center py-4">
                            <button onClick={loadMore} className="btn-outline">
                                Load More
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Explore;
