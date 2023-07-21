"use strict";

const express = require('express'); 
const router = express.Router(); 

const user = require('./user');
const search = require('./search');
const challengesVideos = require('./challengesVideos');
const challengesTutorials = require('./challengesTutorials');
const coachExercices = require('./coachExercices');
const ranking = require('./ranking');
const challenges = require('./challenges');
const clubs = require('./clubs');
const teams = require('./teams');
const gifts = require('./gifts');
const follow = require('./follow');
const comments = require('./comments');
const likes = require('./likes');
const duels = require('./duels');
const contacts = require('./contacts');
const admin = require('./admin');
const general = require('./general');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.json({ title: 'Express' });
});

router.use('/user', user); 
router.use('/search', search);
router.use('/trainings/tutorials', challengesTutorials);
router.use('/trainings/videos', challengesVideos);
router.use('/trainings/coach-exercices', coachExercices);
router.use('/ranking', ranking);
router.use('/trainings/challenges', challenges);
router.use('/gifts', gifts);
router.use('/follow', follow);
router.use('/comments', comments);
router.use('/likes', likes);
router.use('/duels', duels);
router.use('/clubs', clubs);
router.use('/teams', teams);
router.use('/contacts', contacts);
router.use('/admin', admin);
router.use('/general', general);

module.exports = router;
