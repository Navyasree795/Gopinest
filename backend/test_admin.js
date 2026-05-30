const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const testAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ mobile: '8688946165' });
    if (user) {
      console.log('User found:', user.mobile);
      console.log('Current role:', user.role);
      
      if (user.role !== 'admin') {
        user.role = 'admin';
        await user.save();
        console.log('Role updated to admin');
      } else {
        console.log('User is already admin');
      }
    } else {
      console.log('User not found. Creating admin user...');
      const newUser = new User({
        mobile: '8688946165',
        role: 'admin'
      });
      await newUser.save();
      console.log('Admin user created');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testAdmin();
