const mongoose = require('mongoose'),
      Class    = require('./class'),
      passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  classes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class"
  }]
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
