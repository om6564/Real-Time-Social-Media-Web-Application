import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { auth } from '../middleware/auth.js';
import { getIO } from '../socket/socket.js';

const router = express.Router();

// @route   GET /api/users/profile/:userId
// @desc    Get user profile
// @access  Public
router.get('/profile/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .select('-password')
            .populate('followers', 'username profilePicture')
            .populate('following', 'username profilePicture');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/users/profile
// @desc    Update own profile
// @access  Private
router.put('/profile', auth, [
    body('bio').optional().isLength({ max: 200 }).withMessage('Bio cannot exceed 200 characters'),
    body('profilePicture').optional().isString()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { bio, profilePicture } = req.body;

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (bio !== undefined) user.bio = bio;
        if (profilePicture !== undefined) user.profilePicture = profilePicture;

        await user.save();

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                bio: user.bio,
                profilePicture: user.profilePicture
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/users/follow/:userId
// @desc    Follow a user
// @access  Private
router.post('/follow/:userId', auth, async (req, res) => {
    try {
        const userToFollow = await User.findById(req.params.userId);
        const currentUser = await User.findById(req.userId);

        if (!userToFollow) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (req.params.userId === req.userId) {
            return res.status(400).json({ message: 'You cannot follow yourself' });
        }

        // Check if already following
        if (currentUser.following.includes(req.params.userId)) {
            return res.status(400).json({ message: 'Already following this user' });
        }

        // Add to following and followers
        currentUser.following.push(req.params.userId);
        userToFollow.followers.push(req.userId);

        await currentUser.save();
        await userToFollow.save();

        // Create notification
        const notification = new Notification({
            recipient: req.params.userId,
            sender: req.userId,
            type: 'follow',
            message: `${currentUser.username} started following you`
        });
        await notification.save();

        // Populate notification
        await notification.populate('sender', 'username profilePicture');

        // Emit real-time notification
        const io = getIO();
        io.to(req.params.userId).emit('notification', notification);

        res.json({ message: 'User followed successfully' });
    } catch (error) {
        console.error('Follow error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/users/unfollow/:userId
// @desc    Unfollow a user
// @access  Private
router.post('/unfollow/:userId', auth, async (req, res) => {
    try {
        const userToUnfollow = await User.findById(req.params.userId);
        const currentUser = await User.findById(req.userId);

        if (!userToUnfollow) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (req.params.userId === req.userId) {
            return res.status(400).json({ message: 'You cannot unfollow yourself' });
        }

        // Check if not following
        if (!currentUser.following.includes(req.params.userId)) {
            return res.status(400).json({ message: 'You are not following this user' });
        }

        // Remove from following and followers
        currentUser.following = currentUser.following.filter(
            id => id.toString() !== req.params.userId
        );
        userToUnfollow.followers = userToUnfollow.followers.filter(
            id => id.toString() !== req.userId
        );

        await currentUser.save();
        await userToUnfollow.save();

        res.json({ message: 'User unfollowed successfully' });
    } catch (error) {
        console.error('Unfollow error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/users/:userId/followers
// @desc    Get user's followers
// @access  Public
router.get('/:userId/followers', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .populate('followers', 'username profilePicture bio');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user.followers);
    } catch (error) {
        console.error('Get followers error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/users/:userId/following
// @desc    Get user's following
// @access  Public
router.get('/:userId/following', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .populate('following', 'username profilePicture bio');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user.following);
    } catch (error) {
        console.error('Get following error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/users/search
// @desc    Search users by username
// @access  Public
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.trim().length === 0) {
            return res.json([]);
        }

        const users = await User.find({
            username: { $regex: q, $options: 'i' }
        })
            .select('username profilePicture bio')
            .limit(10);

        res.json(users);
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
