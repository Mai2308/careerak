const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');
const User = require('../models/User');
const Mentor = require('../models/Mentor');

// Helper to resolve receiverId to a User _id (whether a User _id or Mentor _id is supplied)
async function resolveUserId(id) {
  if (!id) return null;
  const user = await User.findById(id).select('_id name email role');
  if (user) return user;
  const mentor = await Mentor.findById(id).select('userId name email');
  if (mentor && mentor.userId) {
    const userFromMentor = await User.findById(mentor.userId).select('_id name email role');
    if (userFromMentor) return userFromMentor;
  }
  return null;
}

// Send a message
router.post('/', auth, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content cannot be empty' });
    }

    const receiverUser = await resolveUserId(receiverId);
    if (!receiverUser) {
      return res.status(404).json({ message: 'Recipient user not found' });
    }

    if (receiverUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot send message to yourself' });
    }

    const message = await Message.create({
      senderId: req.user._id,
      receiverId: receiverUser._id,
      content: content.trim()
    });

    res.status(201).json(message);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// Get conversations list for logged-in user
router.get('/conversations', auth, async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Find all messages involving current user
    const messages = await Message.find({
      $or: [{ senderId: currentUserId }, { receiverId: currentUserId }]
    }).sort({ createdAt: -1 });

    const partnerMap = new Map();

    for (const msg of messages) {
      const isSender = msg.senderId.toString() === currentUserId.toString();
      const partnerId = isSender ? msg.receiverId.toString() : msg.senderId.toString();

      if (!partnerMap.has(partnerId)) {
        partnerMap.set(partnerId, {
          latestMessage: msg,
          unreadCount: 0
        });
      }

      if (!isSender && !msg.read) {
        partnerMap.get(partnerId).unreadCount += 1;
      }
    }

    const partnerIds = Array.from(partnerMap.keys());
    const partnerUsers = await User.find({ _id: { $in: partnerIds } }).select('_id name email role rating');

    const userMap = new Map(partnerUsers.map((u) => [u._id.toString(), u]));

    const conversations = partnerIds
      .map((partnerId) => {
        const user = userMap.get(partnerId);
        const data = partnerMap.get(partnerId);
        if (!user) return null;
        return {
          user: {
            _id: user._id,
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            rating: user.rating
          },
          latestMessage: data.latestMessage,
          unreadCount: data.unreadCount
        };
      })
      .filter(Boolean);

    res.json(conversations);
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ message: 'Failed to fetch conversations' });
  }
});

// Get total unread message count for logged-in user
router.get('/unread-count', auth, async (req, res) => {
  try {
    const unreadCount = await Message.countDocuments({
      receiverId: req.user._id,
      read: false
    });
    res.json({ unreadCount });
  } catch (err) {
    console.error('Error fetching unread count:', err);
    res.status(500).json({ message: 'Failed to fetch unread count' });
  }
});

// Get thread with a specific user
router.get('/:otherUserId', auth, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const partnerUser = await resolveUserId(req.params.otherUserId);

    if (!partnerUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otherUserId = partnerUser._id;

    // Mark unread messages from partner as read
    await Message.updateMany(
      { senderId: otherUserId, receiverId: currentUserId, read: false },
      { $set: { read: true } }
    );

    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: currentUserId }
      ]
    }).sort({ createdAt: 1 });

    res.json({
      user: {
        _id: partnerUser._id,
        id: partnerUser._id,
        name: partnerUser.name,
        email: partnerUser.email,
        role: partnerUser.role
      },
      messages
    });
  } catch (err) {
    console.error('Error fetching message thread:', err);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

module.exports = router;
