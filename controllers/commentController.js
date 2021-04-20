const Comment = require('./../models/commentModel');
const Post = require('./../models/postModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.submitComment = catchAsync(async (req, res, next) => {
  const data = {
    post: req.body.postId,
    user: `${req.user._id}`,
    comment: req.body.comment,
  };

  const doc = await Comment.create(data);

  if (!doc) {
    return next(new AppError('There was an error!', 500));
  }

  const docUpdated = await Post.findByIdAndUpdate(
    req.body.postId,
    { last_comment: doc._id },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!docUpdated) {
    return next(new AppError('There was an error!', 500));
  }

  res.status(201).json({
    status: 'success',
    data: doc,
  });
});

exports.getComments = catchAsync(async (req, res, next) => {
  let filter = {};

  if (req.query.postId) {
    filter = { post: req.query.postId };
    delete req.query.postId;
  }

  const features = new APIFeatures(Comment.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const docs = await features.query;

  res.status(200).json({
    status: 'success',
    data: docs,
  });
});
