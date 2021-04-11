const multer = require('multer');
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');

const Post = require('./../models/postModel');

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

  res.status(201).json({
    status: 'success',
    data: data,
  });
};

exports.retrieveAllPosts = async (req, res, next) => {
  const data = await Post.find();

  res.status(200).json({
    status: 'success',
    data: data,
  });
};

exports.uploadPostImage = upload.single('postImage');
