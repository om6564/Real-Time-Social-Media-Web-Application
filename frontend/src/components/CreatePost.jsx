import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaImage, FaTimes } from 'react-icons/fa';
import api from '../utils/api';

const CreatePost = ({ onPostCreated }) => {
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [image, setImage] = useState('');
    const [imagePreview, setImagePreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImage('');
        setImagePreview('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!content.trim() && !image) {
            setError('Please add some content or an image');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await api.post('/posts', {
                content: content.trim(),
                image,
            });

            setContent('');
            setImage('');
            setImagePreview('');

            if (onPostCreated) {
                onPostCreated(response.data.post);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card mb-6">
            <form onSubmit={handleSubmit}>
                <div className="flex items-start space-x-4">
                    {user?.profilePicture ? (
                        <img
                            src={user.profilePicture}
                            alt={user.username}
                            className="w-12 h-12 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-semibold text-lg">
                                {user?.username?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}

                    <div className="flex-1">
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="What's on your mind?"
                            className="w-full border-0 focus:ring-0 resize-none text-lg placeholder-gray-400"
                            rows="3"
                        />

                        {imagePreview && (
                            <div className="relative mt-4">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="rounded-lg max-h-96 w-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 bg-gray-900 bg-opacity-75 text-white rounded-full p-2 hover:bg-opacity-90"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                        )}

                        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
                    </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <label className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 cursor-pointer">
                        <FaImage className="text-xl" />
                        <span className="text-sm font-medium">Add Photo</span>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                    </label>

                    <button
                        type="submit"
                        disabled={loading || (!content.trim() && !image)}
                        className="btn-primary"
                    >
                        {loading ? <span className="spinner"></span> : 'Post'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePost;
