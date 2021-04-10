const express = require('express');

const authController = require('../controllers/authController');
const postController = require('../controllers/postController');

const router = express.Router();

router.post(
  '/create-post',
  authController.protect,
  postController.uploadPostImage,
  postController.createPost
);

module.exports = router;
