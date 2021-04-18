const Comment = require('./../models/commentModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.submitComment = catchAsync(async (req, res, next) => {
  const data = {
    post: req.body.postId,
    user: `${req.user._id}`,
    comment: req.body.comment,
  };

  const doc = await Comment.create(data);

  res.status(201).json({
    status: 'success',
    data: doc,
  });
});
