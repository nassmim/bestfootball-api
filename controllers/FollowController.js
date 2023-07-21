'use strict'

const models = require('../models')

const Follow = models.follow
const User = models.user 
const Player = models.player
const Address = models.address
const City = models.city
const Country = models.country
 
const NotificationsController = require('../controllers/NotificationsController')

const followType = {
    followers: 'Followers',
    following: 'Following'
}

module.exports = {

  async follow(req, res) {

    try {
      const follow = await Follow.findOne({
        where: {
          user_follower_id: req.body.user_follower_id,
          user_following_id: req.body.user_following_id
        }
      })

      if(follow) {
        follow.destroy()
        res.json({follow: false}) 
      } else {
        Follow.create(req.body);
        res.json({follow: true}) 

        sendFollowPushNotification(req.body.user_following_id, req.body.user_follower_id)
      }

    } catch(err) {
      console.log(err)
      res.status(500).json(err)
    }    
  },

  async checkFollowStatus(req, res) {

    try {
      const follow = await Follow.findOne({
        where: {
          user_follower_id: req.params.userId, 
          user_following_id: req.params.userVisitedId
        }
      })

      if(follow) {
        res.json({alreadyFollowed: true}) 
      } else {
        res.json({alreadyFollowed: false}) 
      }

    } catch(err) {
      console.log(err)
      res.status(500).json(err)
    }
  },

  async getFollowersFollowing(req, res) {
    const limit = parseInt(req.params.size),
      offset = limit * parseInt(req.params.page)    
      
    let dataQuery = await buildQuery(req.params.username, req.params.type)

    if(limit) {
      dataQuery['limit'] = limit
      if(offset) {
        dataQuery['offset'] = offset
      }
    }

    try {
      const followers = await Follow.findAll(dataQuery)
      res.json(followers) 
    } catch(err) {
      console.log(err)
      res.status(500).json(err)
    }
  }   
}

async function sendFollowPushNotification(userFollowingId, userFollowerId) {
  let users = []

  const userFollowing = await User.findByPk(userFollowingId),
    userFollower = await User.findByPk(userFollowerId),
    userFollowerUsername = userFollower.username

  users.push(userFollowing)
  
  const message = {
    title: `${userFollowerUsername} te follow !`,
    body: "Viens vite sur BF checker qui c'est !!",
      icon: `${process.env.FRONT_PROTOCOL}://${process.env.FRONT_DOMAIN}/images/logos/bestfootball_logo.png`,
    tag: "new-follow",
    data: {
      url: `${process.env.FRONT_PROTOCOL}://${process.env.FRONT_DOMAIN}/player/profile/${userFollowerUsername}`
    },
    "content-available": 1
  }

  NotificationsController.sendPushNotification(message, users)  
}

async function buildQuery(username, type) {
    let dataQuery 

    const user = await User.findOne({
        where: {username: username}
    })

    const userId = user.id

    if (type === followType.followers) {
        dataQuery = {
            include: {model: User, as: 'userFollower', include: [{model:Address, include:[{model:City, include:[{model:Country}]}]}, {model: Player}]},
            where: {
                user_following_id: userId
            }
        }    
    } else {
        dataQuery = {
            include: {model: User, as: 'userFollowing', include: [{model:Address, include:[{model:City, include:[{model:Country}]}]}, {model: Player}]},
            where: {
                user_follower_id: userId
            }
        }    
    }

  return dataQuery
}

