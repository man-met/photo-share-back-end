const express = require('express');
const followerController = require('../controllers/followerController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/', authController.protect, followerController.getFollowersData);
router.post('/', authController.protect, followerController.startFollowing);
router.delete('/', authController.protect, followerController.stopFollowing);

module.exports = router;
