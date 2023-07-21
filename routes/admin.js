'use strict';
const router = require('express').Router();

const AdminController = require('../controllers/AdminController')

/* Checks whether the password is correct or not */
router.put('/password', (req, res)=> {
  if(req.body.password===process.env.ADMIN_PASS) {
    res.json(true)
  } else {
    res.json(false)
  }
})

/* Sends the notification to users */
router.put('/send-notification', (req, res)=> {
  AdminController.sendPushNotification(req, res)
})

/* Sends the notification to users */
router.post('/challenge-scores-federation', (req, res)=> {
  AdminController.createChallengeScoresFederation(req, res)
})

module.exports = router;
