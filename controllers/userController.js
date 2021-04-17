const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

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
        $or: [
          {
            first_name: {
              $regex: req.query.searchKeyword,
              $options: 'i',
            },
          },
          {
            last_name: {
              $regex: req.query.searchKeyword,
              $options: 'i',
            },
          },
          {
            email: {
              $regex: req.query.searchKeyword,
              $options: 'i',
            },
          },
        ],
      },
    },
    { $unset: ['active', 'password', 'role', '__v'] },
  ]);

  // console.log(req.query.searchKeyword);

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    // results: users.length,
    users: users,
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // Create error if user posts password data.
  if (req.body.password || req.body.password_confirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword',
        400
      )
    );
  }

  // check if it is working
  console.log(req.body);

  // set the file url to body photo
  if (req.file) {
    req.body.photo = req.file.location;
  }

  // pass the fields you want to be updated
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
    // new is set to true so it retrieves the new updated user instead of the old ones
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    user: updatedUser,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  // await User.findByIdAndUpdate(req.user.id, { active: false });

  await User.findByIdAndDelete(req.user.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  // let query = User.findOne({ email: req.params.id });

  let query = User.findOne({ _id: req.params.id });
  // if (popOptions) query = query.populate(popOptions);
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
