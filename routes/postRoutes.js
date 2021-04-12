const express = require('express');

const authController = require('../controllers/authController');
const postController = require('../controllers/postController');

const router = express.Router();

router.post(
  '/create-post',
  authController.protect,
  // SUGGESTION: You might want to pass the url where the image is stored as you will need to pass one for profile picture
  postController.uploadImage,
  postController.createPost
);

router.get(
  '/get-posts',
  authController.protect,
  postController.retrieveAllPosts
);

module.exports = router;
