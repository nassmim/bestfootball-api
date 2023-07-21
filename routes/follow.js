'use strict';
const router = require('express').Router();

const FollowController = require('../controllers/FollowController')


/* Create or update the follow link between the connected user and 
another user */ 
router.put('/', async (req, res, next) => {
  FollowController.follow(req, res)
})

/* Finds if the user already follows a specific user or not */
router.get('/check/:userVisitedId/:userId', async (req, res, next) => {
  FollowController.checkFollowStatus(req, res)
})

/* Gets the list of the user's followers/following */
router.get('/list-of/:type/:username/:size/:page', async (req, res, next) => {
  FollowController.getFollowersFollowing(req, res)
})


module.exports = router;
