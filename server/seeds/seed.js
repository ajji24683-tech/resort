const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const config = require('../config/env');
const User = require('../models/User');
const RoomCategory = require('../models/RoomCategory');
const Room = require('../models/Room');
const RoomPrice = require('../models/RoomPrice');
const Setting = require('../models/Setting');
const { ROLES, STAFF_TYPE, ROOM_STATUS, DEFAULT_SETTINGS } = require('../config/constants');

const seedDB = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      RoomCategory.deleteMany({}),
      Room.deleteMany({}),
      RoomPrice.deleteMany({}),
      Setting.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // ─── Create Users ────────────────────────────────────────
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@yashiiiresort.com',
      password: 'admin123',
      phone: '+91-9000000001',
      role: ROLES.ADMIN,
      isVerified: true,
      isActive: true,
    });

    const manager = await User.create({
      name: 'Resort Manager',
      email: 'manager@yashiiiresort.com',
      password: 'manager123',
      phone: '+91-9000000002',
      role: ROLES.MANAGER,
      isVerified: true,
      isActive: true,
    });

    const staffMembers = await User.insertMany([
      {
        name: 'Priya Sharma',
        email: 'priya@yashiiiresort.com',
        password: '$2a$12$LQ5RFYPkNcFdqS1Lf3Yu2eY1lBKxb/X5v0S3MX3xtFpH5qWJf6rje', // staff123
        phone: '+91-9000000003',
        role: ROLES.STAFF,
        staffType: STAFF_TYPE.HOUSEKEEPING,
        isVerified: true,
      },
      {
        name: 'Rahul Kumar',
        email: 'rahul@yashiiiresort.com',
        password: '$2a$12$LQ5RFYPkNcFdqS1Lf3Yu2eY1lBKxb/X5v0S3MX3xtFpH5qWJf6rje',
        phone: '+91-9000000004',
        role: ROLES.STAFF,
        staffType: STAFF_TYPE.MAINTENANCE,
        isVerified: true,
      },
      {
        name: 'Anjali Patel',
        email: 'anjali@yashiiiresort.com',
        password: '$2a$12$LQ5RFYPkNcFdqS1Lf3Yu2eY1lBKxb/X5v0S3MX3xtFpH5qWJf6rje',
        phone: '+91-9000000005',
        role: ROLES.STAFF,
        staffType: STAFF_TYPE.FRONT_DESK,
        isVerified: true,
      },
    ]);

    const customer = await User.create({
      name: 'Test Customer',
      email: 'customer@example.com',
      password: 'customer123',
      phone: '+91-9000000006',
      role: ROLES.CUSTOMER,
      isVerified: true,
    });

    console.log('Created users');

    // ─── Create Room Categories ──────────────────────────────
    const deluxe = await RoomCategory.create({
      name: 'Deluxe Room',
      description:
        'Experience comfort and elegance in our Deluxe Rooms, featuring premium furnishings, a private balcony with garden views, and modern amenities. Perfect for couples and solo travelers seeking a luxurious retreat amidst nature.',
      shortDescription: 'Premium comfort with private balcony and garden views',
      basePrice: 5500,
      maxGuests: 2,
      bedType: 'king',
      roomSize: 350,
      amenities: [
        'King Bed',
        'Private Balcony',
        'Air Conditioning',
        'Free Wi-Fi',
        'Mini Bar',
        'Room Service',
        'Flat Screen TV',
        'Rain Shower',
        'Coffee Maker',
        'Safe Box',
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85', alt: 'Deluxe Room Overview', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=85', alt: 'Deluxe Room Bathroom' },
        { url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=85', alt: 'Deluxe Room Balcony' },
      ],
      totalRooms: 8,
    });

    const suite = await RoomCategory.create({
      name: 'Premium Suite',
      description:
        'Indulge in the ultimate luxury experience with our Premium Suites. Featuring a separate living area, jacuzzi bathtub, panoramic mountain views, and exclusive concierge service. Ideal for those who demand nothing but the finest.',
      shortDescription: 'Ultimate luxury with living area and panoramic mountain views',
      basePrice: 12000,
      maxGuests: 3,
      bedType: 'suite',
      roomSize: 650,
      amenities: [
        'King Bed',
        'Separate Living Room',
        'Jacuzzi Bathtub',
        'Panoramic Views',
        'Private Terrace',
        'Air Conditioning',
        'Free Wi-Fi',
        'Mini Bar',
        'Room Service',
        '55" Smart TV',
        'Rain Shower',
        'Espresso Machine',
        'Safe Box',
        'Concierge Service',
        'Bathrobes & Slippers',
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=85', alt: 'Premium Suite Overview', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=85', alt: 'Suite Living Area' },
        { url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85', alt: 'Suite Jacuzzi' },
      ],
      totalRooms: 4,
    });

    const villa = await RoomCategory.create({
      name: 'Pool Villa',
      description:
        'Your private paradise awaits in our exclusive Pool Villas. Each villa features a private infinity pool, outdoor dining area, luxury bedroom with premium linens, and a dedicated butler. The epitome of resort living.',
      shortDescription: 'Private paradise with infinity pool and dedicated butler',
      basePrice: 22000,
      maxGuests: 4,
      bedType: 'king',
      roomSize: 1200,
      amenities: [
        'King Bed',
        'Private Infinity Pool',
        'Outdoor Dining',
        'Butler Service',
        'Air Conditioning',
        'Free Wi-Fi',
        'Full Bar',
        'Room Service',
        '65" Smart TV',
        'Luxury Bathroom',
        'Espresso Machine',
        'Safe Box',
        'Garden',
        'Sun Loungers',
        'Outdoor Shower',
        'Premium Toiletries',
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=85', alt: 'Pool Villa Overview', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=85', alt: 'Villa Pool' },
        { url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=85', alt: 'Villa Bedroom' },
      ],
      totalRooms: 3,
    });

    const cottage = await RoomCategory.create({
      name: 'Garden Cottage',
      description:
        'Charming and cozy, our Garden Cottages offer a rustic yet refined escape surrounded by lush tropical gardens. Perfect for families, with spacious interiors, a private patio, and easy access to the resort\'s amenities.',
      shortDescription: 'Charming family-friendly cottage with private garden patio',
      basePrice: 8000,
      maxGuests: 4,
      bedType: 'twin',
      roomSize: 500,
      amenities: [
        'Twin Beds / King Bed',
        'Private Patio',
        'Garden View',
        'Air Conditioning',
        'Free Wi-Fi',
        'Mini Fridge',
        'Room Service',
        'Flat Screen TV',
        'Rain Shower',
        'Coffee Maker',
        'Safe Box',
        'Family Friendly',
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=85', alt: 'Garden Cottage Overview', isPrimary: true },
        { url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85', alt: 'Cottage Patio' },
        { url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=85', alt: 'Cottage Interior' },
      ],
      totalRooms: 5,
    });

    console.log('Created room categories');

    // ─── Create Physical Rooms ───────────────────────────────
    const rooms = [];

    // Deluxe rooms: 101-108 (Floor 1)
    for (let i = 1; i <= 8; i++) {
      rooms.push({
        roomNumber: `${100 + i}`,
        category: deluxe._id,
        floor: 1,
        status: ROOM_STATUS.AVAILABLE,
      });
    }

    // Suites: 201-204 (Floor 2)
    for (let i = 1; i <= 4; i++) {
      rooms.push({
        roomNumber: `${200 + i}`,
        category: suite._id,
        floor: 2,
        status: ROOM_STATUS.AVAILABLE,
      });
    }

    // Villas: V1-V3
    for (let i = 1; i <= 3; i++) {
      rooms.push({
        roomNumber: `V${i}`,
        category: villa._id,
        floor: 0,
        status: ROOM_STATUS.AVAILABLE,
      });
    }

    // Cottages: C1-C5
    for (let i = 1; i <= 5; i++) {
      rooms.push({
        roomNumber: `C${i}`,
        category: cottage._id,
        floor: 0,
        status: ROOM_STATUS.AVAILABLE,
      });
    }

    await Room.insertMany(rooms);
    console.log(`Created ${rooms.length} rooms`);

    // ─── Create Seasonal Pricing ─────────────────────────────
    const currentYear = new Date().getFullYear();
    const categories = [deluxe, suite, villa, cottage];
    const multipliers = [1, 1, 1, 1]; // base multipliers

    for (const cat of categories) {
      await RoomPrice.insertMany([
        {
          category: cat._id,
          seasonName: 'Regular Season',
          startDate: new Date(`${currentYear}-01-01`),
          endDate: new Date(`${currentYear}-03-31`),
          pricePerNight: cat.basePrice,
          weekendSurcharge: Math.round(cat.basePrice * 0.1),
          extraGuestCharge: 500,
        },
        {
          category: cat._id,
          seasonName: 'Summer Season',
          startDate: new Date(`${currentYear}-04-01`),
          endDate: new Date(`${currentYear}-06-30`),
          pricePerNight: Math.round(cat.basePrice * 1.2),
          weekendSurcharge: Math.round(cat.basePrice * 0.15),
          extraGuestCharge: 700,
        },
        {
          category: cat._id,
          seasonName: 'Monsoon Season',
          startDate: new Date(`${currentYear}-07-01`),
          endDate: new Date(`${currentYear}-09-30`),
          pricePerNight: Math.round(cat.basePrice * 0.85),
          weekendSurcharge: Math.round(cat.basePrice * 0.05),
          extraGuestCharge: 400,
        },
        {
          category: cat._id,
          seasonName: 'Peak/Holiday Season',
          startDate: new Date(`${currentYear}-10-01`),
          endDate: new Date(`${currentYear}-12-31`),
          pricePerNight: Math.round(cat.basePrice * 1.5),
          weekendSurcharge: Math.round(cat.basePrice * 0.2),
          extraGuestCharge: 1000,
        },
      ]);
    }
    console.log('Created seasonal pricing');

    // ─── Create System Settings ──────────────────────────────
    const settings = Object.entries(DEFAULT_SETTINGS).map(([key, value]) => ({
      key,
      value,
      category: 'booking',
      description: `Default setting: ${key.replace(/_/g, ' ').toLowerCase()}`,
      updatedBy: admin._id,
    }));

    await Setting.insertMany(settings);
    console.log('Created system settings');

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('  Admin:    admin@yashiiiresort.com / admin123');
    console.log('  Manager:  manager@yashiiiresort.com / manager123');
    console.log('  Customer: customer@example.com / customer123');
    console.log(`\n📊 Created: ${rooms.length} rooms across 4 categories`);

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
