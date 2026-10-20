const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  email: {
    type: String,
  },
  tenantId: {
    type: String,
  },
  subject: {
    type: String,
  },
  message: {
    type: String,
  },
  internalNote: {
    type: String,
  },
  assignedTo: {
    type: String,
  },
  status: {
    type: String,
  },
  createdAt: {
    type: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model("SupportTicket", schema);
