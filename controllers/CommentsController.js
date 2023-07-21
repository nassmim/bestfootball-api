'use strict';

const models = require('../models')
const ChallengeVideo = models.challenge_video
const ChallengeVideoComment = models.challenge_video_comment
const Player = models.player
const User = models.user
 
const NotificationsController = require('../controllers/NotificationsController')

const FRONT_DOMAIN = process.env.FRONT_DOMAIN,
  FRONT_PROTOCOL = process.env.FRONT_PROTOCOL,
  originFrontURL = `${FRONT_PROTOCOL}://${FRONT_DOMAIN}`

module.exports = { 

  async commentVideo(req, res) {
    const videoId = req.body.challenge_video_id

    let users = [],
      message = {
        title: 'Ta vidéo commentée !',
          icon: `${originFrontURL}/public/images/logos/bestfootball_logo.png`,
        tag: "duel",
        data: {
          url: `${originFrontURL}/trainings/video/${videoId}`
        },
        "content-available": 1
      }    

    try {
      const comment = await ChallengeVideoComment.create(req.body)
      res.json(comment)

      const challengeVideo = await ChallengeVideo.findByPk(videoId)
      const user = await User.findByPk(challengeVideo.user_id) 
      users.push(user)
      message['body'] = `${user.username} a commenté ta vidéo !`
      NotificationsController.sendPushNotification(message, users)      

    } catch(err) {
      console.log(err)
      res.status(500).json(err)
    }


  },

  /* Gets all comments on a video */
  async getAllComments(req, res) {

    try {
      const challengeVideoComments = await ChallengeVideoComment.findAll({
          include: [
              {model: ChallengeVideo},
              {model: User, include: [{model: Player}]}
          ],
        where: {
              challenge_video_id: req.params.id
          }
      })

      res.json(challengeVideoComments)
      
    } catch(err) {
      console.log(err)
      res.status(500).json(err)
    }
  }
}