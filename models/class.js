const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
  name: String,
  courseId: String,
  courseUrl: String
});

module.exports = mongoose.model("Class", ClassSchema);

module.exports.classSchema = ClassSchema;
