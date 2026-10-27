const Room = require('../models/Room');
const RoomCategory = require('../models/RoomCategory');
const RoomPrice = require('../models/RoomPrice');
const Booking = require('../models/Booking');
const { BOOKING_STATUS, ROOM_STATUS, DEFAULT_SETTINGS } = require('../config/constants');

/**
 * Get available rooms for given dates and guest count
 * This is the source of truth for room availability
 */
const getAvailableRooms = async (checkIn, checkOut, guestCount = 1) => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  // Find all active rooms that DON'T have overlapping bookings
  const bookedRoomIds = await Booking.distinct('room', {
    status: { $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.CHECKED_IN] },
    $or: [
      // Booking starts during requested period
      { checkIn: { $gte: checkInDate, $lt: checkOutDate } },
      // Booking ends during requested period
      { checkOut: { $gt: checkInDate, $lte: checkOutDate } },
      // Booking encompasses the entire requested period
      { checkIn: { $lte: checkInDate }, checkOut: { $gte: checkOutDate } },
    ],
  });

  // Find available rooms
  const availableRooms = await Room.find({
    _id: { $nin: bookedRoomIds },
    status: { $in: [ROOM_STATUS.AVAILABLE] },
    isActive: true,
  }).populate('category');

  // Filter by guest count
  const suitableRooms = availableRooms.filter(
    (room) => room.category && room.category.maxGuests >= guestCount && room.category.isActive
  );

  return suitableRooms;
};

/**
 * Get available rooms grouped by category with pricing
 */
const getAvailableCategories = async (checkIn, checkOut, guestCount = 1) => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  // Find all active rooms that DON'T have overlapping bookings
  const bookedRoomIds = await Booking.distinct('room', {
    status: { $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.CHECKED_IN] },
    $or: [
      { checkIn: { $gte: checkInDate, $lt: checkOutDate } },
      { checkOut: { $gt: checkInDate, $lte: checkOutDate } },
      { checkIn: { $lte: checkInDate }, checkOut: { $gte: checkOutDate } },
    ],
  });

  // Find all available physical rooms
  const allAvailableRooms = await Room.find({
    _id: { $nin: bookedRoomIds },
    status: { $in: [ROOM_STATUS.AVAILABLE] },
    isActive: true,
  }).populate('category');

  // Group by category
  const categoryMap = {};
  for (const room of allAvailableRooms) {
    if (!room.category || !room.category.isActive) continue;
    const catId = room.category._id.toString();
    if (!categoryMap[catId]) {
      categoryMap[catId] = {
        category: room.category,
        availableCount: 0,
        rooms: [],
      };
    }
    categoryMap[catId].availableCount++;
    categoryMap[catId].rooms.push(room);
  }

  // Calculate pricing for each category
  const result = [];
  const totalNights = calculateNights(checkIn, checkOut);
  for (const catId of Object.keys(categoryMap)) {
    const pricePerNight = await calculatePricePerNight(catId, checkIn, checkOut);
    result.push({
      ...categoryMap[catId],
      pricePerNight,
      totalNights,
      totalPrice: pricePerNight * totalNights,
    });
  }

  return result;
};

/**
 * Intelligent Multi-Room & Capacity Combination Engine
 * Given a target guest count (e.g. 6 guests), computes all valid single-room and multi-room combinations:
 * - 1 Room (e.g. 1 Room with capacity 6)
 * - 2 Rooms (e.g. 1 Room cap 4 + 1 Room cap 2 = 6, or 2 Rooms cap 3 = 6)
 * - 3 Rooms (e.g. 3 Rooms with cap 2 each = 6)
 */
const getAvailableRoomCombinations = async (checkIn, checkOut, guestCount = 1) => {
  const availableCategories = await getAvailableCategories(checkIn, checkOut);
  const totalNights = calculateNights(checkIn, checkOut);

  if (!availableCategories || availableCategories.length === 0) {
    return [];
  }

  const combinations = [];
  const seenSignatures = new Set();

  const addCombination = (combo) => {
    // Generate signature like "catA:1_catB:2"
    const sigParts = combo.rooms
      .map((r) => `${r.category._id}:${r.quantity}`)
      .sort();
    const signature = sigParts.join('|');

    if (seenSignatures.has(signature)) return;
    seenSignatures.add(signature);
    combinations.push(combo);
  };

  // 1. Single Room Options (1 Room with capacity >= guestCount)
  for (const item of availableCategories) {
    if (item.availableCount >= 1 && item.category.maxGuests >= guestCount) {
      addCombination({
        id: `single_${item.category._id}`,
        type: 'single',
        roomsCount: 1,
        totalCapacity: item.category.maxGuests,
        title: `1 × ${item.category.name}`,
        capacityBadge: `1 Room (Capacity: ${item.category.maxGuests} Guests)`,
        breakdownText: `1 Room with capacity for ${item.category.maxGuests} guests`,
        pricePerNight: item.pricePerNight,
        totalNights,
        totalPrice: item.totalPrice,
        primaryCategory: item.category,
        primaryRoom: item.rooms[0],
        rooms: [
          {
            category: item.category,
            quantity: 1,
            capacity: item.category.maxGuests,
            pricePerNight: item.pricePerNight,
            availableCount: item.availableCount,
            primaryRoom: item.rooms[0],
          },
        ],
      });
    }
  }

  // 2. Two-Room Combinations (2 Rooms with total capacity >= guestCount)
  if (guestCount > 1) {
    for (let i = 0; i < availableCategories.length; i++) {
      for (let j = i; j < availableCategories.length; j++) {
        const catA = availableCategories[i];
        const catB = availableCategories[j];

        // Stock check
        const canUse = i === j ? catA.availableCount >= 2 : catA.availableCount >= 1 && catB.availableCount >= 1;
        if (!canUse) continue;

        const combinedCapacity = catA.category.maxGuests + catB.category.maxGuests;
        if (combinedCapacity >= guestCount && combinedCapacity <= Math.max(guestCount + 3, 6)) {
          const isSame = i === j;
          const comboPricePerNight = isSame ? catA.pricePerNight * 2 : catA.pricePerNight + catB.pricePerNight;
          const comboTotalPrice = comboPricePerNight * totalNights;

          const title = isSame ? `2 × ${catA.category.name}` : `1 × ${catA.category.name} + 1 × ${catB.category.name}`;

          const capacityBadge = isSame
            ? `2 Rooms (${catA.category.name} Capacity: ${catA.category.maxGuests} each)`
            : `2 Rooms (1 Room Cap: ${catA.category.maxGuests}, 1 Room Cap: ${catB.category.maxGuests})`;

          const breakdownText = isSame
            ? `2 Rooms of ${catA.category.name} (Combined capacity: ${combinedCapacity} guests)`
            : `1 Room of ${catA.category.name} (Cap: ${catA.category.maxGuests}) + 1 Room of ${catB.category.name} (Cap: ${catB.category.maxGuests})`;

          addCombination({
            id: `combo_2_${catA.category._id}_${catB.category._id}`,
            type: 'combination',
            roomsCount: 2,
            totalCapacity: combinedCapacity,
            title,
            capacityBadge,
            breakdownText,
            pricePerNight: comboPricePerNight,
            totalNights,
            totalPrice: comboTotalPrice,
            primaryCategory: catA.category,
            primaryRoom: catA.rooms[0],
            rooms: isSame
              ? [
                  {
                    category: catA.category,
                    quantity: 2,
                    capacity: catA.category.maxGuests,
                    pricePerNight: catA.pricePerNight,
                    availableCount: catA.availableCount,
                    primaryRoom: catA.rooms[0],
                  },
                ]
              : [
                  {
                    category: catA.category,
                    quantity: 1,
                    capacity: catA.category.maxGuests,
                    pricePerNight: catA.pricePerNight,
                    availableCount: catA.availableCount,
                    primaryRoom: catA.rooms[0],
                  },
                  {
                    category: catB.category,
                    quantity: 1,
                    capacity: catB.category.maxGuests,
                    pricePerNight: catB.pricePerNight,
                    availableCount: catB.availableCount,
                    primaryRoom: catB.rooms[0],
                  },
                ],
          });
        }
      }
    }
  }

  // 3. Three-Room Combinations (3 Rooms with total capacity >= guestCount)
  if (guestCount >= 4) {
    for (let i = 0; i < availableCategories.length; i++) {
      for (let j = i; j < availableCategories.length; j++) {
        for (let k = j; k < availableCategories.length; k++) {
          const catA = availableCategories[i];
          const catB = availableCategories[j];
          const catC = availableCategories[k];

          // Count needed per category
          const needed = {};
          needed[catA.category._id] = (needed[catA.category._id] || 0) + 1;
          needed[catB.category._id] = (needed[catB.category._id] || 0) + 1;
          needed[catC.category._id] = (needed[catC.category._id] || 0) + 1;

          let stockOk = true;
          if (needed[catA.category._id] > catA.availableCount) stockOk = false;
          if (needed[catB.category._id] > catB.availableCount) stockOk = false;
          if (needed[catC.category._id] > catC.availableCount) stockOk = false;
          if (!stockOk) continue;

          const combinedCapacity = catA.category.maxGuests + catB.category.maxGuests + catC.category.maxGuests;
          if (combinedCapacity >= guestCount && combinedCapacity <= Math.max(guestCount + 4, 8)) {
            const comboPricePerNight = catA.pricePerNight + catB.pricePerNight + catC.pricePerNight;
            const comboTotalPrice = comboPricePerNight * totalNights;

            // Formulate clean room breakdown
            const categoryCounts = {};
            [catA, catB, catC].forEach((c) => {
              categoryCounts[c.category._id] = {
                category: c.category,
                quantity: (categoryCounts[c.category._id]?.quantity || 0) + 1,
                pricePerNight: c.pricePerNight,
                primaryRoom: c.rooms[0],
                availableCount: c.availableCount,
              };
            });

            const roomList = Object.values(categoryCounts);
            const title = roomList.map((r) => `${r.quantity} × ${r.category.name}`).join(' + ');

            const capacityBadge =
              roomList.length === 1
                ? `3 Rooms (${roomList[0].category.name} Capacity: ${roomList[0].category.maxGuests} each)`
                : `3 Rooms (${roomList.map((r) => `${r.quantity} Room${r.quantity > 1 ? 's' : ''} Cap: ${r.category.maxGuests}`).join(', ')})`;

            addCombination({
              id: `combo_3_${catA.category._id}_${catB.category._id}_${catC.category._id}`,
              type: 'combination',
              roomsCount: 3,
              totalCapacity: combinedCapacity,
              title,
              capacityBadge,
              breakdownText: `3 Rooms combination with total capacity for ${combinedCapacity} guests`,
              pricePerNight: comboPricePerNight,
              totalNights,
              totalPrice: comboTotalPrice,
              primaryCategory: catA.category,
              primaryRoom: catA.rooms[0],
              rooms: roomList,
            });
          }
        }
      }
    }
  }

  // 4. Fallback Single Categories: if guestCount is small (e.g. 1 or 2), include all available categories as 1-room options
  if (guestCount <= 2) {
    for (const item of availableCategories) {
      if (item.availableCount >= 1) {
        addCombination({
          id: `single_${item.category._id}`,
          type: 'single',
          roomsCount: 1,
          totalCapacity: item.category.maxGuests,
          title: `1 × ${item.category.name}`,
          capacityBadge: `1 Room (Capacity: ${item.category.maxGuests} Guests)`,
          breakdownText: `1 Room with capacity for ${item.category.maxGuests} guests`,
          pricePerNight: item.pricePerNight,
          totalNights,
          totalPrice: item.totalPrice,
          primaryCategory: item.category,
          primaryRoom: item.rooms[0],
          rooms: [
            {
              category: item.category,
              quantity: 1,
              capacity: item.category.maxGuests,
              pricePerNight: item.pricePerNight,
              availableCount: item.availableCount,
              primaryRoom: item.rooms[0],
            },
          ],
        });
      }
    }
  }

  // Sort: fewest rooms first, then lowest price
  combinations.sort((a, b) => {
    if (a.roomsCount !== b.roomsCount) {
      return a.roomsCount - b.roomsCount;
    }
    return a.totalPrice - b.totalPrice;
  });

  return combinations;
};

/**
 * Check if a specific room is available for given dates
 */
const isRoomAvailable = async (roomId, checkIn, checkOut, excludeBookingId = null) => {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  const query = {
    room: roomId,
    status: { $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.CHECKED_IN] },
    $or: [
      { checkIn: { $gte: checkInDate, $lt: checkOutDate } },
      { checkOut: { $gt: checkInDate, $lte: checkOutDate } },
      { checkIn: { $lte: checkInDate }, checkOut: { $gte: checkOutDate } },
    ],
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const overlapping = await Booking.countDocuments(query);
  return overlapping === 0;
};

/**
 * Calculate price per night for a category based on seasonal pricing
 */
const calculatePricePerNight = async (categoryId, checkIn, checkOut) => {
  const checkInDate = new Date(checkIn);

  const seasonalPrice = await RoomPrice.findOne({
    category: categoryId,
    startDate: { $lte: checkInDate },
    endDate: { $gte: checkInDate },
    isActive: true,
  }).sort({ createdAt: -1 });

  if (seasonalPrice) {
    return seasonalPrice.pricePerNight;
  }

  const category = await RoomCategory.findById(categoryId);
  return category ? category.basePrice : 0;
};

/**
 * Calculate total booking amount on the server side
 */
const calculateBookingAmount = async (categoryId, checkIn, checkOut, guests) => {
  const totalNights = calculateNights(checkIn, checkOut);
  const pricePerNight = await calculatePricePerNight(categoryId, checkIn, checkOut);
  const subtotal = pricePerNight * totalNights;
  const taxRate = DEFAULT_SETTINGS.TAX_PERCENT / 100;
  const taxAmount = Math.round(subtotal * taxRate);
  const totalAmount = subtotal + taxAmount;

  return {
    pricePerNight,
    totalNights,
    subtotal,
    taxAmount,
    totalAmount,
  };
};

/**
 * Calculate number of nights between two dates
 */
const calculateNights = (checkIn, checkOut) => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end.getTime() - start.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/**
 * Calculate refund amount based on cancellation policy
 */
const calculateRefundAmount = (booking) => {
  const now = new Date();
  const checkIn = new Date(booking.checkIn);
  const hoursUntilCheckIn = (checkIn - now) / (1000 * 60 * 60);

  if (hoursUntilCheckIn >= DEFAULT_SETTINGS.CANCELLATION_FREE_HOURS) {
    return booking.totalAmount;
  }

  const penalty = (booking.totalAmount * DEFAULT_SETTINGS.CANCELLATION_PENALTY_PERCENT) / 100;
  return Math.max(0, booking.totalAmount - penalty);
};

module.exports = {
  getAvailableRooms,
  getAvailableCategories,
  getAvailableRoomCombinations,
  isRoomAvailable,
  calculatePricePerNight,
  calculateBookingAmount,
  calculateNights,
  calculateRefundAmount,
};

