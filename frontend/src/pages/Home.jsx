import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import api from '../utils/api';
import { FaInbox } from 'react-icons/fa';

const Home = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        fetchFeed();
    }, []);

    const fetchFeed = async () => {
        try {
            const response = await api.get(`/posts/feed/personalized?page=${page}&limit=10`);
            const { posts: newPosts, totalPages } = response.data;

            setPosts((prev) => [...prev, ...newPosts]);
            setHasMore(page < totalPages);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching feed:', error);
            setLoading(false);
        }
    };

    const handlePostCreated = (newPost) => {
        setPosts((prev) => [newPost, ...prev]);
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
        fetchFeed();
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-6">
            <CreatePost onPostCreated={handlePostCreated} />

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="spinner border-primary-600"></div>
                </div>
            ) : posts.length === 0 ? (
                <div className="card text-center py-12">
                    <FaInbox className="text-6xl text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Your feed is empty</h3>
                    <p className="text-gray-500 mb-4">
                        Follow some users to see their posts here
                    </p>
                    <a href="/explore" className="btn-primary inline-block">
                        Explore
                    </a>
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

export default Home;
