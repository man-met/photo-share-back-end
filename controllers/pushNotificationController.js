const catchAsync = require('./../utils/catchAsync');
// const AppError = require('./../utils/appError');
const webpush = require('web-push');

const PushNotification = require('./../models/pushNotificationModel');

// Config WebPush
webpush.setVapidDetails(
  'mailto:test@mail.com',
  process.env.WEB_PUSH_PUBLIC_VAPID_KEY,
  process.env.WEB_PUSH_PRIVATE_VAPID_KEY
);

exports.createNotificationsSubscription = catchAsync(async (req, res, next) => {
  req.body.subscriptionData.user = req.user._id;

  const doc = await PushNotification.create(req.body.subscriptionData);

  console.log(doc);

  res.status(200).json({
    status: 'success',
    data: doc,
  });
});

exports.sendNotification = catchAsync(async () => {
  const subscriptions = await PushNotification.find();

  subscriptions.forEach(async (subscription) => {
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        auth: subscription.keys.auth,
        p256dh: subscription.keys.p256dh,
      },
    };
    const pushContent = {
      title: 'New QuickChat Post',
      body: 'New Post has been added, You can check in the app',
      openUrl: '/#/',
    };
    const response = await webpush.sendNotification(
      pushSubscription,
      JSON.stringify(pushContent)
    );
    console.log(response);
  });
});
