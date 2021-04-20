const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const { escapeRegExp } = require('./../utils/utils');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.aggregate([
    {
      $match: {
        $and: [
          {
            $or: [
              {
                first_name: {
                  $regex: escapeRegExp(req.query.searchKeyword),
                  $options: 'i',
                },
              },
              {
                last_name: {
                  $regex: escapeRegExp(req.query.searchKeyword),
                  $options: 'i',
                },
              },
              {
                email: {
                  $regex: escapeRegExp(req.query.searchKeyword),
                  $options: 'i',
                },
              },
            ],
          },
          {
            _id: { $ne: req.user._id },
          },
        ],
      },
    },
    { $unset: ['active', 'password', 'role', '__v'] },
  ]);

  res.status(200).json({
    status: 'success',
    users: users,
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.password_confirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword',
        400
      )
    );
  }

  console.log(req.body);

  if (req.file) {
    req.body.photo = req.file.location;
  }

  const filteredBody = filterObj(
    req.body,
    'first_name',
    'last_name',
    'bio',
    'photo'
  );

  console.log(filteredBody);

  console.log('USER ID');
  console.log(req.user.id);

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    user: updatedUser,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndDelete(req.user.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  let query = User.findOne({ _id: req.params.id });
  const doc = await query;

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: doc,
    },
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!',
  });
};
