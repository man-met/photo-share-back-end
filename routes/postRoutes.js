const express = require('express');

const authController = require('../controllers/authController');
const postController = require('../controllers/postController');

const router = express.Router();

router.post(
  '/create-post',
  authController.protect,
  postController.uploadImage,
  postController.createPost
);

router.get(
  '/get-posts',
  authController.protect,
  postController.retrieveAllPosts
);

module.exports = router;
