const User = require("../models/user.model");

// Get one user
const getUserDb = async (query) => {
  const user = await User.findOne(query);

  return user;
};

// Create user
const createUserDb = async (query) => {
  try {
    const user = await new User(query).save();
    return user;
  } catch (error) {
    console.error("createUserDb: " + error);
  }
};

// Edit info
const editUserDb = async (query) => {
  try {
    const { _id, listTextRandom } = query;
    const userForEdit = await getUserDb({ _id });

    userForEdit.listTextRandoms = listTextRandom;

    const rs = await userForEdit.save();
    return rs;
  } catch (error) {
    console.error("editUserDb: " + error);
  }
};

module.exports = {
  getUserDb,
  createUserDb,
  editUserDb,
};
