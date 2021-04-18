const Follower = require('./../models/followerModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.startFollowing = catchAsync(async (req, res, next) => {
  const data = {
    user: req.user._id,
    is_following: req.body.userToFollow,
  };

  const docExists = await Follower.findOne(data);

  if (docExists) {
    return next(new AppError('The user is already being followed!', 400));
  }

  const doc = await Follower.create(data);

  res.status(201).json({
    status: 'success',
    data: doc,
  });
});

exports.getFollowersData = catchAsync(async (req, res, next) => {
  console.log(req.user);

  const followings = await Follower.find({ user: req.user._id });

  const followers = await Follower.find({ is_following: req.user._id });

  res.status(201).json({
    status: 'success',
    data: {
      followings: followings,
      followers: followers,
    },
  });
});
