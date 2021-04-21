const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    // jwt expires in
    expiresIn: process.env.JWT_EXPIRES_IN * 24 * 60 * 60 * 1000,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // console.log('***************** TOKEN ****************');
  // console.log(token);

  // const cookieOptions = {
  //   // cookie expires in
  //   expires: new Date(
  //     Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
  //   ),
  //   httpOnly: true,
  //   secure: true,
  //   sameSite: 'None',
  // };
  // CRITICAL: You must check that when the cookie expires, does it not authenticate the user. If it does find out how to make sure it is deleted when it expires

  // if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  // res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;
  // console.log(res);

  res.status(statusCode).json({
    status: 'success',
    // INFO: token is not sent anymore as it is stored in the cookie
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const emailExists = await User.findOne({ email: req.body.email });

  if (emailExists) {
    res.status(409).json({
      status: 'Conflict',
    });
    return;
  }

  const newUser = await User.create(req.body);
  createSendToken(newUser, 201, res);
  // SUGGESTION: There is no special route for creating admins so the user will have to change it manually in the database
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // console.log(email, password);

  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // INFO: int the brackets it should be email = email but as ES6 syntax allows we can only put email.
  const user = await User.findOne({ email }).select('+password'); // check if the user exists

  // check if the passwords match
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect Email or Password!', 401));
  }

  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get the token check if it is there
  console.log(req.headers);
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // } else if (req.cookies.jwt) {
  //   token = req.cookies.jwt;
  // }
  // console.log(token);

  if (token === 'loggedout' || !token) {
    res.status(200).json({
      status: 'success',
    });
    return;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to gain access.', 401)
    );
  }
  // 2) Verify the token if someone has manipulated or is expired
  // console.log(token);
  // console.log(process.env.JWT_SECRET);
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded);

  // 3) Check if the user still exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError('The user belonging to this token does no longer exist!'),
      401
    );
  }

  // 4) If user changed password after JWT Token was issued
  // INFO: passes the timestamp that is decoded from the JWT token
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('Recently changed password! Please log in again'),
      401
    );
  }

  req.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'lead-guide']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with email address.', 404));
  }

  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  // disable all the validators
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Update changedPasswordAt property for the user
  // 4) Log the user in, send JWT
  createSendToken(user, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!

  // 4) Log user in, send JWT
  createSendToken(user, 200, req, res);
});

exports.isUserAuthenticated = catchAsync(async (req, res, next) => {
  // console.log(req.user);
  // console.log(req.cookies);
  createSendToken(req.user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: true,
    sameSite: 'None',
  });
  res.status(200).json({ status: 'success' });
};
