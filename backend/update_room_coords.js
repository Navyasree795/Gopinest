const mongoose = require('mongoose');
const Room = require('./models/Room');
require('dotenv').config();

const citiesCoords = {
  'bangalore': { lat: 12.9716, lng: 77.5946 },
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'delhi': { lat: 28.6139, lng: 77.2090 },
  'hyderabad': { lat: 17.3850, lng: 78.4867 },
  'chennai': { lat: 13.0827, lng: 80.2707 },
  'kolkata': { lat: 22.5726, lng: 88.3639 },
  'pune': { lat: 18.5204, lng: 73.8567 },
  'ahmedabad': { lat: 23.0225, lng: 72.5714 }
};

const updateRooms = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smartstay-hub-db');
    console.log('Connected to DB');

    const rooms = await Room.find({});
    console.log(`Found ${rooms.length} rooms`);

    for (const room of rooms) {
      const city = room.city ? room.city.toLowerCase() : 'bangalore';
      const baseCoords = citiesCoords[city] || citiesCoords['bangalore'];
      
      // Add slight randomness to spread markers
      const lat = baseCoords.lat + (Math.random() - 0.5) * 0.1;
      const lng = baseCoords.lng + (Math.random() - 0.5) * 0.1;

      room.lat = lat;
      room.lng = lng;
      await room.save();
      console.log(`Updated room: ${room.title} with coords [${lat}, ${lng}]`);
    }

    console.log('All rooms updated successfully');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error updating rooms:', err);
    process.exit(1);
  }
};

updateRooms();
