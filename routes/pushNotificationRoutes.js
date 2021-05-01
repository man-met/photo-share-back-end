const express = require('express');
const authController = require('../controllers/authController');
const pushNotificationController = require('../controllers/pushNotificationController');

const router = express.Router();

router.post(
  '',
  authController.protect,
  pushNotificationController.createNotificationsSubscription
);

module.exports = router;
