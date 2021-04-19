const express = require('express');
const authController = require('../controllers/authController');
const commentController = require('../controllers/commentController');

const router = express.Router();

router.get('', authController.protect, commentController.getComments);
router.post('', authController.protect, commentController.submitComment);

module.exports = router;
