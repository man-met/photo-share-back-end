const multer = require('multer');
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');

const APIFeatures = require('./../utils/apiFeatures');
const Post = require('./../models/postModel');
const pushNotificationController = require('../controllers/pushNotificationController');

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: process.env.AWS_REGION,
});

const s3 = new aws.S3();

const multerStorage = multerS3({
  s3: s3,
  bucket: 'quickchat',
  acl: 'public-read',
  key: (req, file, cb) => {
    const name = file.originalname.split('.')[0];
    const ext = file.mimetype.split('/')[1];
    cb(null, `users/${req.user._id}/${req.user._id}-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    // CRITICAL: make sure you change from null to APPERROR once it works
    cb(null, false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.createPost = async (req, res, next) => {
  // console.log(req.body);
  // console.log(req.file.location);

  const post = {
    postImage: req.file.location,
    caption: req.body.caption,
    user: req.user._id,
  };

  const doc = await Post.create(post);

  const data = [];

  data.push(doc);

  pushNotificationController.sendNotification();

  res.status(201).json({
    status: 'success',
    data: data,
  });
};

exports.retrieveAllPosts = async (req, res, next) => {
  let filter = {};
  // console.log(req.query);

  if (req.params.userId) {
    filter = { user: req.params.userId };
  }

  const features = new APIFeatures(Post.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  // console.log('Query: ', features.query);
  const data = await features.query;

  // console.log('Query results:');
  // console.log(data);

  res.status(200).json({
    status: 'success',
    data: data,
  });
};

exports.uploadImage = upload.single('postImage');
