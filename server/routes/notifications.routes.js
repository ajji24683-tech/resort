const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Notification = require('../models/Notification');

router.use(protect);

// Get user's notifications
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments({ user: req.user._id });
    const unread = await Notification.countDocuments({ user: req.user._id, isRead: false });

    res.status(200).json({
      success: true,
      data: { notifications, total, unread, page, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
});

// Mark as read
router.put('/:id/read', async (req, res, next) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true }
    );
    res.status(200).json({ success: true, message: 'Marked as read' });
  } catch (error) {
    next(error);
  }
});

// Mark all as read
router.put('/read-all', async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );
    res.status(200).json({ success: true, message: 'All marked as read' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
