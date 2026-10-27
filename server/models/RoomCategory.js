const mongoose = require('mongoose');

const roomCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    shortDescription: {
      type: String,
      maxlength: [300, 'Short description cannot exceed 300 characters'],
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Base price cannot be negative'],
    },
    maxGuests: {
      type: Number,
      required: [true, 'Max guests is required'],
      min: [1, 'At least 1 guest required'],
      max: [10, 'Max 10 guests per room'],
    },
    bedType: {
      type: String,
      enum: ['single', 'double', 'queen', 'king', 'twin', 'suite'],
      default: 'double',
    },
    roomSize: {
      type: Number, // in sq ft
      default: 0,
    },
    amenities: [
      {
        type: String,
        trim: true,
      },
    ],
    images: [
      {
        url: { type: String, required: true },
        alt: { type: String, default: '' },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    totalRooms: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug from name
roomCategorySchema.pre('save', function () {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
});

roomCategorySchema.index({ isActive: 1 });

module.exports = mongoose.model('RoomCategory', roomCategorySchema);
