'use strict';
const router = require('express').Router();
const models = require('../models')

const LikeGiven = models.like_given
const LikesController = require('../controllers/LikesController')

// The user likes a video
router.put('/challenge-video', async (req, res, next) => {
    LikesController.like(req, res)
})

// Checks if the user has already liked a specific video 
router.get('/check/challenge-video/:challengeVideoId/:userId', (req, res, next) => {
    LikeGiven.find({where: {challenge_video_id: req.params.challengeVideoId,  user_id: req.params.userId}})
    .then(like=> res.json({like: like}))
    .catch(err=> res.status(500).json(err));
})

module.exports = router;
