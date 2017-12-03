const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://localhost/quince');

mongoose.connection
  .once('open', () => {
    console.log('Connection success');
  })
  .on('error', (error) => {
    console.log('Connection error');
  });

/* * * * * * * * * * * * * * * * * * * * * * * * * * *
  Schema
* * * * * * * * * * * * * * * * * * * * * * * * * * */

const Schema = mongoose.Schema;

const SongSchema = new Schema({
  name: String,
  artist: String,
  image: String,
  link: String,
  userName: String,
  upVoteCount: {type: Number, default: 1},
  downVoteCount: {type: Number, default: 0},
  netVoteCount: Number
});

SongSchema.pre('save', function(next) {
  this.netVoteCount = this.upVoteCount - this.downVoteCount;
  next();
});

const UserSchema = new Schema({
  name: String,
  addedSongs: Array,
  votedSongs: Array
});

/* * * * * * * * * * * * * * * * * * * * * * * * * * *
  Models
* * * * * * * * * * * * * * * * * * * * * * * * * * */

const Song = mongoose.model('song', SongSchema);
const User = mongoose.model('user', UserSchema);

module.exports = {
  Song: Song,
  User: User
};
