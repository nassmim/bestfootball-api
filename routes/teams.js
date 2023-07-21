'use strict';
const router = require('express').Router();
const multer = require('multer');
let path = require('path')

const models = require('../models')
const Team = models.team

const TeamsController = require('../controllers/TeamsController')
const UploadController = require('../controllers/UploadController')


// Sets up the location for uploaded users images
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
        cb(null, `../${process.env.FRONT_FOLDER_NAME}/${process.env.PUBLIC_FOLDER_NAME}/upload/images/teams`)
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
})
let upload = multer({ storage: storage })


/* Updates the user's avatar */
router.post('/upload/avatar/:teamUniqueName', upload.single('file'),  (req, res, next) => {
  UploadController.uploadFile(req, res, 'TeamAvatar') 
})

/* The user adds a team */
router.post('/add', (req, res, next) => {
	TeamsController.addTeam(req, res)
})

/* The user get the teams */
router.get('/list/:teamIdentifier/:userId/:roles', (req, res, next) => {
	TeamsController.getTeams(req, res)
})

/* The user adds a player in the team */
router.put('/add-player', (req, res, next) => {
	TeamsController.addTeamPlayer(req, res)
})

// The user removes his team
router.delete('/remove/:teamId/:clubId?', (req, res, next) => {
  TeamsController.removeTeam(req, res) 
})

/* The user removes a player in the team */
router.delete('/remove-player/:userId/:teamId', (req, res, next) => {
	TeamsController.removeTeamPlayer(req, res)
})


module.exports = router;
