'use strict';
const router = require('express').Router();

const RankingController = require('../controllers/RankingController')

/* Shows the ranking among players for the challenges and duels */
router.get('/filter/:userId/:teamsIds/:seasonId/:ageCategoryId/:gender/:country/:sectionName/:challengesCategoryId/:challengeId/:size/:page', async (req, res, next) => {
  RankingController.getRanking(req, res)
})


module.exports = router;
