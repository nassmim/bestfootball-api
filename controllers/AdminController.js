'use strict'

const models = require('../models')
const User = models.user
const ChallengeScoreFederation = models.challenge_score_federation

const NotificationsController = require('../controllers/NotificationsController')

module.exports = {

  async sendPushNotification(req, res) {

    try {
      // Finds all users who subscribed to notifications
      const users = await User.findAll({
        where: {
          activated: true,
          notification_subscription_endpoint: {
            $ne: null
          }
        }
      })

      const messageData = req.body,
        message = {
        title: messageData.title,
        body: messageData.body,
        icon: messageData.icon,
        tag: messageData.tag,
        data: {
          url: messageData.url
        },
        "content-available": 1
      }

      NotificationsController.sendPushNotification(message, users)    
      res.json(true) 
        
    } catch(err) {
      console.log(err)
      res.status(500).json(err)
    }    
  },

// Defines the scores to reach to fulfill Federation requirements
  createChallengeScoresFederation(req, res) {
    const categories = req.body.categories,
      categoriesLenght = categories.length,
      scores = req.body.scores,
      challengeId = req.body.challengeId,
      countryId = req.body.countryId

    try {
      for(let i=1;i<categoriesLenght;i++) {

        ChallengeScoreFederation.create({
          challenge_id: challengeId,
          country_id: countryId,
          player_category_id: categories[i],
          score: scores[i]
        })
      } 

      res.json(true)
    } catch(err) {
      console.log(err)
      res.status(500).json(err)
    }
  }  
}