'use strict';
const router = require('express').Router();
const multer = require('multer');
let path = require('path')

const models = require('../models')
const ChallengeVideo = models.challenge_video

const ChallengesVideosController = require('../controllers/ChallengesVideosController')
const UploadController = require('../controllers/UploadController')


// Sets up the location for uploaded training video 
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
        cb(null, `../${process.env.FRONT_FOLDER_NAME}/${process.env.PUBLIC_FOLDER_NAME}/upload/videos/challenges/participations`)
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
})

let upload = multer({ storage: storage })

/* The user uploads a video for a challenge participation */ 
router.post('/upload', upload.single('file'), (req, res, next) => {
  UploadController.uploadFile(req, res, 'ChallengeVideo') 
})

// The user participates to a training challenge
router.put('/participate', (req, res, next) => {
  ChallengesVideosController.participate(req, res)
})

/* Gets the latest training videos */
router.get(['/latest-videos/:size', '/list/page/:page'], (req, res, next) => {
  ChallengesVideosController.getLatestChallengesVideos(req, res)
})

/* Gets and filters all training videos  */
router.get('/filter-by/:userId/:teamsIds/:seasonId/:ageCategoryId/:categoryId/:challengeId/:videoId/:watched/:size/:page/:getFullLength?', (req, res, next) => {
  ChallengesVideosController.getChallengesVideos(req, res)
})
 
/* Gets users who liked the video */
router.get('/users-who-liked/:videoId', (req, res, next)=> {
  ChallengesVideosController.getWhoLikedVideo(req, res)
})

// Deletes a training video from the database
router.delete('/remove/:identification', (req, res, next) => {
  UploadController.deleteVideo(req, res, ChallengeVideo)
})


module.exports = router;
