const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoomCategory',
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      maxlength: 200,
      default: '',
    },
    comment: {
      type: String,
      maxlength: 2000,
      default: '',
    },
    managerReply: {
      type: String,
      maxlength: 1000,
      default: '',
    },
    repliedAt: Date,
    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

reviewSchema.index({ booking: 1 }, { unique: true });
reviewSchema.index({ user: 1 });
reviewSchema.index({ category: 1, rating: 1 });

module.exports = mongoose.model('Review', reviewSchema);
