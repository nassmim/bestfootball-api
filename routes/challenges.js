'use strict';
const router = require('express').Router(); 
const multer = require('multer');
let path = require('path')

const models = require('../models')
const Challenge = models.challenge
const ChallengeCategory = models.challenge_category

const ChallengesController = require('../controllers/ChallengesController')
const UploadController = require('../controllers/UploadController')

  
// Where the videos uploaded for the challenges are locally stocked
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
        cb(null, `../${process.env.FRONT_FOLDER_NAME}/${process.env.PUBLIC_FOLDER_NAME}/upload/videos/challenges/presentations`)
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
})

let upload = multer({ storage: storage }) 

/* The user uploads a video for a challenge proposition  */ 
router.post('/upload', upload.single('file'),  (req, res, next) => {
  UploadController.uploadFile(req, res, 'Challenge') 
})

/* The user proposes us a new challenge */
router.post('/user-proposition', (req, res, next) => {
  ChallengesController.createChallenge(req, res)
})

/* Admin accepts the challenge created by a user */
router.post('/user-proposition/accept', (req, res, next) => {
  ChallengesController.acceptChallenge(req, res)
})

/* The user sees all challenges or filters them by category */
router.get(['/filter-by/:name/:teamsIds/:seasonId/:ageCategoryId/:categoryId/:size/:page/:order', '/page/:page'], (req, res, next) => {
  ChallengesController.getChallenges(req, res)
})  

/* Gets the challenge stats */
router.get('/stats/:challengeId/:userId/:size?', (req, res, next) => {
  ChallengesController.getChallengeStats(req, res)
})

/* Gets the category associated to the challenge */
router.get('/categories/:challengeId', (req, res, next) => {
  ChallengesController.getCategories(req.params.challengeId, ChallengeCategory, Challenge, res)
})

/* Gets the status users can obtain thanks to their points in the challenges */
router.get('/all-status', (req, res, next) => {
    ChallengesController.getAllStatus(res)
})

// Deletes a video from the database
router.delete('/remove/:identification', (req, res, next) => {
  UploadController.deleteVideo(req, res, Challenge)
});


module.exports = router;
