const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
  name: String,
  id: String,
  url: String
});

module.exports = mongoose.model("Class", ClassSchema);
