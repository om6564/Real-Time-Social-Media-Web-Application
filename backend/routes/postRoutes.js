import express from 'express';
import { body, validationResult } from 'express-validator';
import Post from '../models/Post.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { auth } from '../middleware/auth.js';
import { getIO } from '../socket/socket.js';

const router = express.Router();

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', auth, [
    body('content').trim().notEmpty().withMessage('Post content is required')
        .isLength({ max: 1000 }).withMessage('Post cannot exceed 1000 characters'),
    body('image').optional().isString()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { content, image } = req.body;

        const post = new Post({
            author: req.userId,
            content,
            image: image || ''
        });

        await post.save();
        await post.populate('author', 'username profilePicture');

        res.status(201).json({
            message: 'Post created successfully',
            post
        });
    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/posts/:postId
// @desc    Edit a post
// @access  Private
router.put('/:postId', auth, [
    body('content').trim().notEmpty().withMessage('Post content is required')
        .isLength({ max: 1000 }).withMessage('Post cannot exceed 1000 characters'),
    body('image').optional().isString()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if user is the author
        if (post.author.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized to edit this post' });
        }

        const { content, image } = req.body;
        post.content = content;
        if (image !== undefined) post.image = image;

        await post.save();
        await post.populate('author', 'username profilePicture');

        res.json({
            message: 'Post updated successfully',
            post
        });
    } catch (error) {
        console.error('Edit post error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/posts/:postId
// @desc    Delete a post
// @access  Private
router.delete('/:postId', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if user is the author
        if (post.author.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }

        await Post.findByIdAndDelete(req.params.postId);

        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/posts/:postId
// @desc    Get a single post
// @access  Public
router.get('/:postId', async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId)
            .populate('author', 'username profilePicture')
            .populate('comments.user', 'username profilePicture')
            .populate('likes', 'username profilePicture');

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json(post);
    } catch (error) {
        console.error('Get post error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/posts/:postId/like
// @desc    Like/Unlike a post
// @access  Private
router.post('/:postId/like', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const likeIndex = post.likes.indexOf(req.userId);

        if (likeIndex > -1) {
            // Unlike
            post.likes.splice(likeIndex, 1);
            await post.save();
            return res.json({ message: 'Post unliked', liked: false, likesCount: post.likes.length });
        } else {
            // Like
            post.likes.push(req.userId);
            await post.save();

            // Create notification if not liking own post
            if (post.author.toString() !== req.userId) {
                const user = await User.findById(req.userId);
                const notification = new Notification({
                    recipient: post.author,
                    sender: req.userId,
                    type: 'like',
                    post: post._id,
                    message: `${user.username} liked your post`
                });
                await notification.save();
                await notification.populate('sender', 'username profilePicture');

                // Emit real-time notification
                const io = getIO();
                io.to(post.author.toString()).emit('notification', notification);
            }

            return res.json({ message: 'Post liked', liked: true, likesCount: post.likes.length });
        }
    } catch (error) {
        console.error('Like post error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/posts/:postId/comment
// @desc    Add a comment to a post
// @access  Private
router.post('/:postId/comment', auth, [
    body('text').trim().notEmpty().withMessage('Comment text is required')
        .isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const { text } = req.body;

        const comment = {
            user: req.userId,
            text
        };

        post.comments.push(comment);
        await post.save();

        // Populate the new comment
        await post.populate('comments.user', 'username profilePicture');
        const newComment = post.comments[post.comments.length - 1];

        // Create notification if not commenting on own post
        if (post.author.toString() !== req.userId) {
            const user = await User.findById(req.userId);
            const notification = new Notification({
                recipient: post.author,
                sender: req.userId,
                type: 'comment',
                post: post._id,
                message: `${user.username} commented on your post`
            });
            await notification.save();
            await notification.populate('sender', 'username profilePicture');

            // Emit real-time notification
            const io = getIO();
            io.to(post.author.toString()).emit('notification', notification);
        }

        res.status(201).json({
            message: 'Comment added successfully',
            comment: newComment
        });
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/posts/:postId/comment/:commentId
// @desc    Delete a comment
// @access  Private
router.delete('/:postId/comment/:commentId', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const comment = post.comments.id(req.params.commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check if user is the comment author or post author
        if (comment.user.toString() !== req.userId && post.author.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }

        comment.deleteOne();
        await post.save();

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Delete comment error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/posts/feed
// @desc    Get personalized feed (posts from followed users)
// @access  Private
router.get('/feed/personalized', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Get posts from followed users
        const posts = await Post.find({ author: { $in: user.following } })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('author', 'username profilePicture')
            .populate('comments.user', 'username profilePicture')
            .populate('likes', 'username profilePicture');

        const total = await Post.countDocuments({ author: { $in: user.following } });

        res.json({
            posts,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalPosts: total
        });
    } catch (error) {
        console.error('Get feed error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/posts/latest
// @desc    Get latest posts from all users
// @access  Public
router.get('/latest/all', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('author', 'username profilePicture')
            .populate('comments.user', 'username profilePicture')
            .populate('likes', 'username profilePicture');

        const total = await Post.countDocuments();

        res.json({
            posts,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalPosts: total
        });
    } catch (error) {
        console.error('Get latest posts error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/posts/user/:userId
// @desc    Get posts by a specific user
// @access  Public
router.get('/user/:userId', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const posts = await Post.find({ author: req.params.userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('author', 'username profilePicture')
            .populate('comments.user', 'username profilePicture')
            .populate('likes', 'username profilePicture');

        const total = await Post.countDocuments({ author: req.params.userId });

        res.json({
            posts,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalPosts: total
        });
    } catch (error) {
        console.error('Get user posts error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
