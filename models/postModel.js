const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  postImage: {
    type: String,
    required: [true, 'A post must have an image!'],
    unique: true,
  },
  caption: {
    type: String,
    maxLength: 2200,
  },
  last_comment: {
    type: mongoose.Schema.ObjectId,
    ref: 'Comment',
  },
  likesQuantity: {
    type: Number,
    default: 0,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A post must belong to a user'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

postSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    // to select only relevant data.
    select: 'first_name last_name photo email',
  }).populate({
    path: 'last_comment',
    select: '_id post user comment createdAt',
    populate: {
      path: 'user',
      model: 'User',
      select: 'first_name last_name photo',
    },
  });
  next();
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
