// services/userService.js
const User = require('../models/user.models');

const getAllUsers = async () => {
  return await User.find();
};

const getUserById = async (id) => {
  return await User.findById(id);
};

const createUser = async (name, email) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists with this email');
    }
    
    const user = new User({ name, email });
    await user.save();
    
    return user; // Return the created user
  };
  

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
};
