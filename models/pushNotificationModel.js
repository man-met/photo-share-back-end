const mongoose = require('mongoose');

const pushNotificationSchema = new mongoose.Schema({
  endpoint: {
    type: String,
    required: [true, 'Subscription must have an endpoint!'],
  },
  expirationTime: {
    type: String,
    default: null,
  },
  keys: {
    type: { String },
    required: [true, 'Subscription must have keys!'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'User ID must present'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const PushNotification = mongoose.model(
  'PushNotification',
  pushNotificationSchema
);

module.exports = PushNotification;
