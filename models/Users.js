const mongoose = require("mongoose");

const UserdeatilsSchema = mongoose.Schema({
  email: {
    type: String,
  },
  secret: {
    type: String,
  },
});

const Userdetails = mongoose.model("userdetail", UserdeatilsSchema);
module.exports = Userdetails;
