'use strict';
const router = require('express').Router();
const multer = require('multer');
let path = require('path')

const models = require('../models')
const ChallengeTutorial = models.challenge_tutorial

const ChallengesTutorialsController = require('../controllers/ChallengesTutorialsController')
const UploadController = require('../controllers/UploadController')


// Sets up the location for uploaded training video 
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
        cb(null, `../${process.env.FRONT_FOLDER_NAME}/${process.env.PUBLIC_FOLDER_NAME}/upload/videos/challenges/tutorials`)
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
})

let upload = multer({ storage: storage })

/* The user uploads a video for a challenge participation */ 
router.post('/upload', upload.single('file'), (req, res, next) => {
  UploadController.uploadFile(req, res, 'ChallengeTutorial') 
})

/* The user proposes us a new challenge */
router.post('/user-proposition', (req, res, next) => {
  ChallengesTutorialsController.createChallengeTutorial(req, res, 'ChallengeTutorial')
})

/* Admin accepts the challenge created by a user */
router.post('/user-proposition/accept', (req, res, next) => {
  ChallengesTutorialsController.acceptChallengeTutorial(req.body.id, req.body.challenge_id)
})

/* Gets and filters all training videos  */
router.get('/filter-by/:name/:teamsIds/:seasonId/:ageCategoryId/:categoryId/:challengeId/:size/:page/:order', (req, res, next) => {
  ChallengesTutorialsController.getChallengesTutorials(req, res)
})

// Deletes a tutorial video from the database
router.delete('/remove/:identification', (req, res, next) => {
  UploadController.deleteVideo(req, res, ChallengeTutorial)
})


module.exports = router;
