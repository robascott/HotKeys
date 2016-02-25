var mongoose = require("mongoose");

var raceSchema = mongoose.Schema({
  wpm: { type: Number },
  user: { type: mongoose.Schema.ObjectId, ref: 'User' }
});

module.exports = mongoose.model("Race", raceSchema);