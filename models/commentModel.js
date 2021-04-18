const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.ObjectId,
    ref: 'Post',
    required: [true, 'Post ID must be present'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'User ID must present'],
  },
  comment: {
    type: String,
    maxLength: [500, 'A comment must have less than 500 characters'],
    minLength: [1, 'A comment must have at least one character!'],
    required: [true, 'A comment must be present!'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

commentSchema.index({ createdAt: -1 });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
