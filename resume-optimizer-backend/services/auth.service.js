const User = require('../models/User.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const registerUser = async (name, email, password) => {
  
  console.log("Backend is checking for email:", email);

  const userExists = await User.findOne({ email });

  console.log("Backend found this existing user:", userExists);

  if (userExists) {
    throw new Error('User already exists');

  }

  const user = new User({ name, email, password });
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);
  
  await user.save();
  return user;
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }
  
  const payload = { user: { id: user.id } };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '10d' });
  
  return { token };
};

module.exports = {
  registerUser,
  loginUser,
};