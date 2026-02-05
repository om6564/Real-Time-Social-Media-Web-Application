import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaTrash } from 'react-icons/fa';
import { formatDistanceToNow } from '../utils/dateUtils';
import api from '../utils/api';

const CommentSection = ({ postId, comments, onCommentAdded, onCommentDeleted }) => {
    const { user } = useAuth();
    const [commentText, setCommentText] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!commentText.trim()) return;

        setLoading(true);
        try {
            const response = await api.post(`/posts/${postId}/comment`, {
                text: commentText.trim(),
            });

            setCommentText('');
            if (onCommentAdded) {
                onCommentAdded(response.data.comment);
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm('Delete this comment?')) return;

        try {
            await api.delete(`/posts/${postId}/comment/${commentId}`);
            if (onCommentDeleted) {
                onCommentDeleted(commentId);
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    return (
        <div className="mt-4 pt-4 border-t border-gray-200">
            {/* Comment Input */}
            <form onSubmit={handleSubmit} className="mb-4">
                <div className="flex items-start space-x-3">
                    {user?.profilePicture ? (
                        <img
                            src={user.profilePicture}
                            alt={user.username}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-semibold">
                                {user?.username?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}

                    <div className="flex-1">
                        <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Write a comment..."
                            className="w-full input-field"
                        />
                    </div>

                    <button type="submit" disabled={loading || !commentText.trim()} className="btn-primary">
                        {loading ? <span className="spinner"></span> : 'Post'}
                    </button>
                </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4">
                {comments.map((comment) => (
                    <div key={comment._id} className="flex items-start space-x-3">
                        <Link to={`/profile/${comment.user._id}`}>
                            {comment.user.profilePicture ? (
                                <img
                                    src={comment.user.profilePicture}
                                    alt={comment.user.username}
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-xs font-semibold">
                                        {comment.user.username?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                        </Link>

                        <div className="flex-1 bg-gray-100 rounded-lg px-4 py-2">
                            <div className="flex items-center justify-between">
                                <Link
                                    to={`/profile/${comment.user._id}`}
                                    className="font-semibold text-sm text-gray-900 hover:underline"
                                >
                                    {comment.user.username}
                                </Link>

                                {user?.id === comment.user._id && (
                                    <button
                                        onClick={() => handleDelete(comment._id)}
                                        className="text-red-600 hover:text-red-700 text-sm"
                                    >
                                        <FaTrash />
                                    </button>
                                )}
                            </div>

                            <p className="text-gray-800 mt-1">{comment.text}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                {formatDistanceToNow(comment.createdAt)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CommentSection;
