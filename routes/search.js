'use strict';
const router = require('express').Router();
const models  = require('../models');

const Country = models.country

const SearchController = require('../controllers/SearchController')


/* Gets all countries */
router.get(['/countries/list', '/page/:page'], async (req, res, next) => {
  try {
    const countries = await Country.findAll()
    res.json(countries);
  } catch(err) {
    console.log(err)
  }
})

/* The user is doing an advanced research to find other users
based on several filters */
router.get('/advanced-research/:statusId/:bestSkillId/:gender/:clubName/:categoryId/:positionId/:preferredFootId/:cityName/:countryName/:size/:page', async(req, res, next)=> {
  SearchController.advancedResearch(req, res)  
})

module.exports = router;
