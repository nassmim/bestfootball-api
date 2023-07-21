'use strict';
const router = require('express').Router();
const GeneralController = require('../controllers/GeneralController');
const models  = require('../models');

const Country = models.country

/* Retrieves all users */
router.get('/get-all-users', async (req, res) => {
    GeneralController.getUsers(res)
})

/* Gets all clubs */
router.get('/get-all-clubs', (req, res) => {
    GeneralController.getClubs(res)
})

/* Gets all countries */
router.get('/get-all-countries', async (req, res) => {
    GeneralController.getCountries(res)
})

/* Gets characteristics that are needed to define a user  */
router.get('/players-characteristics', (req, res) => {
    GeneralController.getPlayerCharacteristics(res)
})

/* Gets characteristics that are needed to define a user  */
router.get('/get-all-seasons', (req, res) => {
    GeneralController.getSeasons(res)
})

module.exports = router;
