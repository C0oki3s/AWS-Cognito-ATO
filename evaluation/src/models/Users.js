const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  email: {
    type: String,
  },
  secret: {
    type: String,
  },
  sub: {
    type: String,
  },
  role: {
    type: String,
  },
  tenantId: {
    type: String,
  },
  active: {
    type: Boolean,
  },
  displayName: {
    type: String,
  },
  createdAt: {
    type: Date,
  },
  updatedAt: {
    type: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model("Users", schema);
