const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    min: 2,
    max: 255,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
    max: 1024,
    min: 2,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Users", UserSchema);
