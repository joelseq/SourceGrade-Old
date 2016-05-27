const mongoose = require('mongoose'),
      User     = require('./user');

const ClassSchema = new mongoose.Schema({
  name: String,
  courseId: String,
  courseUrl: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
});

module.exports = mongoose.model("Class", ClassSchema);

module.exports.classSchema = ClassSchema;
