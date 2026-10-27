const RoomCategory = require('../models/RoomCategory');
const Room = require('../models/Room');
const Review = require('../models/Review');
const {
  getAvailableCategories,
  getAvailableRooms,
  getAvailableRoomCombinations,
} = require('../services/availability.service');

/**
 * @desc    Get all room categories
 * @route   GET /api/rooms/categories
 * @access  Public
 */
const getCategories = async (req, res, next) => {
  try {
    const categories = await RoomCategory.find({ isActive: true }).sort({ basePrice: 1 });

    // Get average rating for each category
    const categoriesWithRating = await Promise.all(
      categories.map(async (cat) => {
        const ratingData = await Review.aggregate([
          { $match: { category: cat._id, isPublished: true } },
          { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
        ]);

        const catObj = cat.toObject();
        catObj.avgRating = ratingData[0]?.avgRating || 0;
        catObj.reviewCount = ratingData[0]?.count || 0;

        // Count available rooms
        const availableCount = await Room.countDocuments({
          category: cat._id,
          status: 'available',
          isActive: true,
        });
        catObj.availableRooms = availableCount;

        return catObj;
      })
    );

    res.status(200).json({
      success: true,
      data: { categories: categoriesWithRating },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single category detail
 * @route   GET /api/rooms/categories/:id
 * @access  Public
 */
const getCategoryDetail = async (req, res, next) => {
  try {
    const category = await RoomCategory.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Room category not found',
      });
    }

    // Get reviews
    const reviews = await Review.find({
      category: category._id,
      isPublished: true,
    })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    // Rating stats
    const ratingData = await Review.aggregate([
      { $match: { category: category._id, isPublished: true } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    // Available rooms count
    const availableCount = await Room.countDocuments({
      category: category._id,
      status: 'available',
      isActive: true,
    });

    res.status(200).json({
      success: true,
      data: {
        category,
        reviews,
        avgRating: ratingData[0]?.avgRating || 0,
        reviewCount: ratingData[0]?.count || 0,
        availableRooms: availableCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Search available rooms by dates and guests
 * @route   GET /api/rooms/search?checkIn=&checkOut=&guests=
 * @access  Public
 */
const searchRooms = async (req, res, next) => {
  try {
    const { checkIn, checkOut, guests } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Check-in and check-out dates are required',
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const now = new Date();

    // Validate dates
    if (checkInDate < now) {
      return res.status(400).json({
        success: false,
        message: 'Check-in date cannot be in the past',
      });
    }

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date',
      });
    }

    const guestCount = parseInt(guests) || 1;
    const [availableCategories, availableCombinations] = await Promise.all([
      getAvailableCategories(checkIn, checkOut, guestCount),
      getAvailableRoomCombinations(checkIn, checkOut, guestCount),
    ]);

    res.status(200).json({
      success: true,
      data: {
        checkIn,
        checkOut,
        guests: guestCount,
        categories: availableCategories,
        combinations: availableCombinations,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get reviews for the resort (public)
 * @route   GET /api/rooms/reviews
 * @access  Public
 */
const getPublicReviews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ isPublished: true })
      .populate('user', 'name avatar')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ isPublished: true });

    const overallRating = await Review.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        reviews,
        total,
        page,
        pages: Math.ceil(total / limit),
        avgRating: overallRating[0]?.avgRating || 0,
        reviewCount: overallRating[0]?.count || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single room detail
 * @route   GET /api/rooms/:id
 * @access  Public
 */
const getRoomDetail = async (req, res, next) => {
  try {
    let room = await Room.findById(req.params.id).populate('category');
    if (!room) {
      // Check if id was a category ID
      const roomForCat = await Room.findOne({ category: req.params.id, isActive: true }).populate('category');
      if (roomForCat) {
        room = roomForCat;
      } else {
        const cat = await RoomCategory.findById(req.params.id);
        if (cat) {
          room = {
            _id: req.params.id,
            roomNumber: 'Assigned upon check-in',
            floor: 1,
            category: cat,
          };
        }
      }
    }

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }
    res.status(200).json({
      success: true,
      data: { room },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryDetail,
  searchRooms,
  getPublicReviews,
  getRoomDetail,
};
