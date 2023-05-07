const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      min: 6,
      max: 30,
      unique: true,
    },
    password: {
      type: String,
      required: false,
    },
    fullName: {
      type: String,
      required: true,
    },
    listTextRandoms: {
      type: Array,
      required: false,
    },
    listUrlImages: {
      type: Array,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
