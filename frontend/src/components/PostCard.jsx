import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaHeart, FaRegHeart, FaComment, FaEdit, FaTrash, FaEllipsisH } from 'react-icons/fa';
import { formatDistanceToNow } from '../utils/dateUtils';
import CommentSection from './CommentSection';
import api from '../utils/api';

const PostCard = ({ post: initialPost, onDelete, onUpdate }) => {
    const { user } = useAuth();
    const [post, setPost] = useState(initialPost);
    const [showComments, setShowComments] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.content);
    const [loading, setLoading] = useState(false);

    const isOwnPost = user?.id === post.author._id;
    const isLiked = post.likes?.some((like) => like._id === user?.id || like === user?.id);

    const handleLike = async () => {
        try {
            const response = await api.post(`/posts/${post._id}/like`);
            const { liked, likesCount } = response.data;

            setPost((prev) => ({
                ...prev,
                likes: liked
                    ? [...(prev.likes || []), user]
                    : (prev.likes || []).filter((like) => like._id !== user?.id && like !== user?.id),
            }));
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;

        try {
            await api.delete(`/posts/${post._id}`);
            if (onDelete) onDelete(post._id);
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    const handleEdit = async () => {
        if (!editContent.trim()) return;

        setLoading(true);
        try {
            const response = await api.put(`/posts/${post._id}`, {
                content: editContent,
                image: post.image,
            });

            setPost(response.data.post);
            setIsEditing(false);
            if (onUpdate) onUpdate(response.data.post);
        } catch (error) {
            console.error('Error editing post:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCommentAdded = (newComment) => {
        setPost((prev) => ({
            ...prev,
            comments: [...(prev.comments || []), newComment],
        }));
    };

    const handleCommentDeleted = (commentId) => {
        setPost((prev) => ({
            ...prev,
            comments: (prev.comments || []).filter((c) => c._id !== commentId),
        }));
    };

    return (
        <div className="card mb-4 animate-fade-in">
            {/* Post Header */}
            <div className="flex items-center justify-between mb-4">
                <Link to={`/profile/${post.author._id}`} className="flex items-center space-x-3">
                    {post.author.profilePicture ? (
                        <img
                            src={post.author.profilePicture}
                            alt={post.author.username}
                            className="w-12 h-12 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center">
                            <span className="text-white font-semibold">
                                {post.author.username?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}

                    <div>
                        <p className="font-semibold text-gray-900 hover:underline">
                            {post.author.username}
                        </p>
                        <p className="text-sm text-gray-500">{formatDistanceToNow(post.createdAt)}</p>
                    </div>
                </Link>

                {isOwnPost && (
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="text-gray-400 hover:text-gray-600 p-2"
                        >
                            <FaEllipsisH />
                        </button>

                        {showMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                                <button
                                    onClick={() => {
                                        setIsEditing(true);
                                        setShowMenu(false);
                                    }}
                                    className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                                >
                                    <FaEdit />
                                    <span>Edit</span>
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50"
                                >
                                    <FaTrash />
                                    <span>Delete</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Post Content */}
            {isEditing ? (
                <div className="mb-4">
                    <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full input-field"
                        rows="3"
                    />
                    <div className="flex space-x-2 mt-2">
                        <button onClick={handleEdit} disabled={loading} className="btn-primary">
                            {loading ? <span className="spinner"></span> : 'Save'}
                        </button>
                        <button onClick={() => setIsEditing(false)} className="btn-secondary">
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <p className="text-gray-900 mb-4 whitespace-pre-wrap">{post.content}</p>
            )}

            {/* Post Image */}
            {post.image && (
                <img
                    src={post.image}
                    alt="Post"
                    className="rounded-lg w-full object-cover mb-4 max-h-96"
                />
            )}

            {/* Post Stats */}
            <div className="flex items-center justify-between text-sm text-gray-500 mb-3 pb-3 border-b border-gray-200">
                <span>{post.likes?.length || 0} likes</span>
                <span>{post.comments?.length || 0} comments</span>
            </div>

            {/* Post Actions */}
            <div className="flex items-center space-x-4">
                <button
                    onClick={handleLike}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${isLiked
                            ? 'text-red-600 bg-red-50 hover:bg-red-100'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    {isLiked ? <FaHeart /> : <FaRegHeart />}
                    <span className="font-medium">Like</span>
                </button>

                <button
                    onClick={() => setShowComments(!showComments)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                >
                    <FaComment />
                    <span className="font-medium">Comment</span>
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <CommentSection
                    postId={post._id}
                    comments={post.comments || []}
                    onCommentAdded={handleCommentAdded}
                    onCommentDeleted={handleCommentDeleted}
                />
            )}
        </div>
    );
};

export default PostCard;
