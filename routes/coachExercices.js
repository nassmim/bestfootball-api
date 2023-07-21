'use strict';
const router = require('express').Router();
const multer = require('multer');
let path = require('path')

const models = require('../models')
const CoachExercice = models.coach_exercice
const CoachExerciceModule = models.coach_exercice_module

const CoachExercicesController = require('../controllers/CoachExercicesController')
const ChallengesController = require('../controllers/ChallengesController')
const UploadController = require('../controllers/UploadController')


/* The user proposes us a new challenge */
router.post('/user-proposition', (req, res) => {
  CoachExercicesController.createExercice(req, res, 'ChallengeTutorial')
})

/* Gets and filters all exercices */
router.get('/filter-by/:name/:teamsIds/:seasonId/:ageCategoryId/:moduleId/:size/:page/:order', (req, res) => {
    CoachExercicesController.getExercises(req, res)
})

/* Gets the exercice stats */
router.put('/player-score/update', (req, res) => {
    CoachExercicesController.updateExercisePlayerScore(req, res)
})

/* Gets the exercice stats */
router.get('/stats/:exerciceId/:userId?', (req, res) => {
    CoachExercicesController.getExerciseStats(req, res)
})

/* Gets the category associated to the exercice */
router.get('/modules/:userId?/:exerciseId?/:teamId?', (req, res) => {
    CoachExercicesController.getModules(req, res)
})

// Deletes a tutorial video from the database
router.delete('/remove/:identification', (req, res) => {
  UploadController.deleteVideo(req, res, ChallengeTutorial)
})


module.exports = router;
