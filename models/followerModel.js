const mongoose = require('mongoose');
// const validator = require('validator');

const followerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Must be followed by a user'],
  },
  is_following: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Must be following a user'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Follower = mongoose.model('Follower', followerSchema);

module.exports = Follower;
