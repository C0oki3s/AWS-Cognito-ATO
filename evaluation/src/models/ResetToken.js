const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  email: {
    type: String,
  },
  token: {
    type: String,
  },
  expiresAt: {
    type: Date,
  },
  used: {
    type: Boolean,
  },
  createdAt: {
    type: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model("ResetToken", schema);
