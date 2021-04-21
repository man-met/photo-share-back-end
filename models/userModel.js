const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// create a user schema
const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: [true, 'Please provide your first name.'],
    trim: true,
    maxLength: [20, 'A user must have less than or equal to 20 characters.'],
    minLength: [1, 'A user must have more than or equal to 1 characters.'],
  },
  last_name: {
    type: String,
    required: [true, 'Please provide your last name.'],
    trim: true,
    maxLength: [20, 'A user must have less than or equal to 20 characters.'],
    minLength: [1, 'A user must have more than or equal to 1 characters.'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    type: String,
    default: 'img/default.jpeg',
  },
  bio: {
    type: String,
    maxLength: 150,
    default: '',
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'User must enter a password!'],
    minLength: 8,
    // INFO: select is set to false so it does not add in to the response body when a user makes a request.
    select: false,
  },
  password_confirm: {
    type: String,
    required: [true, 'Please confirm the password!'],
    validata: {
      // this only works on CREATE & SAVE
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords should match!',
    },
  },
  // last time password changed
  passwordChangedAt: {
    type: Date,
  },
  // INFO: password Rest token and password reset expires work together
  // stores the password reset token
  passwordResetToken: {
    type: String,
  },
  // save when the reset password token expires
  passwordResetExpires: {
    type: Date,
  },
  // check if the user account has been deleted
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  // check if the password has been modified in the current document
  if (!this.isModified('password')) return next();

  // hash the password using bcrypt module
  this.password = await bcrypt.hash(this.password, 12);

  // delete confirm password after password checked and confirmed
  this.password_confirm = undefined;

  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

// INFO: Instance Method DEFINITION: A method that is available in all the documents of a certain collection
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  // false means that the user did not changed the password
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log({ resetToken }, this.passwordResetToken);
  // add the time amount after the password reset token expires
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
