const User = require("../models/user.model");

// Get one user
const getUserDb = async (query) => {
  const user = await User.findOne(query);

  return user;
};

// Create user
const createUserDb = async (query) => {
  const user = await new User(query).save();

  return user;
};

module.exports = {
  getUserDb,
  createUserDb,
};
