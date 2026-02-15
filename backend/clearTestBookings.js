/**
 * Script to clear test bookings from database
 * Run with: node clearTestBookings.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Booking = require('./src/models/BookingModel');

const clearTestBookings = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Option 1: Delete all bookings (use with caution!)
    // const result = await Booking.deleteMany({});
    
    // Option 2: Delete only pending/unpaid bookings
    const result = await Booking.deleteMany({
      'payment.status': 'pending'
    });
    
    // Option 3: Delete bookings from today onwards
    // const today = new Date();
    // today.setHours(0, 0, 0, 0);
    // const result = await Booking.deleteMany({
    //   bookingDate: { $gte: today }
    // });

    console.log(`✅ Deleted ${result.deletedCount} test bookings`);
    
    // Show remaining bookings
    const remaining = await Booking.countDocuments();
    console.log(`📊 Remaining bookings: ${remaining}`);

    await mongoose.connection.close();
    console.log('👋 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

clearTestBookings();
