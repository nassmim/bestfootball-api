'use strict';
const router = require('express').Router();

const DuelsController = require('../controllers/DuelsController')
const UploadController = require('../controllers/UploadController')

const multer = require('multer');
let path = require('path')

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
        cb(null, `../${process.env.FRONT_FOLDER_NAME}/${process.env.PUBLIC_FOLDER_NAME}/upload/videos/duels`)
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
})

let upload = multer({storage: storage})

// The user uploads a video for a duel
router.put('/upload', upload.single('file'), (req, res) => {
  UploadController.uploadFile(req, res, 'Duel') 
})

/* The user asks another user for a duel */
router.post('/request', (req, res) => {
  DuelsController.requestDuel(req, res)
})

/* Gets all the user's duels requests (received and sent) */
router.get('/all/:userId/:statusId/:size/:page/:closed?', (req, res) => {
    DuelsController.getDuels(req, res)
})

/* Gets a specific duel between 2 users */
router.get('/opposition/:id', (req, res) => {
  DuelsController.getOneDuel(req, res)
})

// The user accepts or refuses the duel
router.put('/answer', (req, res) => {
  DuelsController.answerDuel(req, res)
})
 
// The user participates to the duel
router.put('/participate', (req, res) => {
  DuelsController.participateDuel(req, res)
})

// Deletes a training video from the database
router.delete('/remove-video/:duelId/:videoToRemove', (req, res) => {
    DuelsController.deleteVideo(req, res)
})

module.exports = router;
