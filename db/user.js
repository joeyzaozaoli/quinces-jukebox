const mongoose = require('./config');
const Song = require('./song');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: String,
  addedSongs: Array,
  votedSongs: Array
});

const User = mongoose.model('user', UserSchema);

// dummy data
new User({name: 'jessica'}).save();
new User({name: 'nick'}).save();
new User({name: 'vasanth'}).save();
new User({name: 'joey'}).save();
// do NOT delete the anonymous user
new User({name: 'anonymous'}).save();

module.exports = User;