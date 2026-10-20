const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  ownerEmail: {
    type: String,
  },
  tenantId: {
    type: String,
  },
  title: {
    type: String,
  },
  body: {
    type: String,
  },
  shareToken: {
    type: String,
  },
  visibility: {
    type: String,
  },
  createdAt: {
    type: Date,
  },
  updatedAt: {
    type: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model("Document", schema);
