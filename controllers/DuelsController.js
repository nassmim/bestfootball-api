'use strict';
const models  = require('../models');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env]
const rolesNames = config.roles

const Challenge = models.challenge
const User =  models.user 
const Player = models.player
const Duel =  models.duel
const DuelResult =  models.duel_result
const DuelStatus =  models.duel_status
const DuelSummary =  models.duel_summary

const EarningController = require('../controllers/EarningController')
const NotificationsController = require('../controllers/NotificationsController')
const UserController = require('../controllers/UserController')

const FRONT_DOMAIN = process.env.FRONT_DOMAIN,
    FRONT_PROTOCOL = process.env.FRONT_PROTOCOL,
    originFrontURL = `${FRONT_PROTOCOL}://${FRONT_DOMAIN}`

module.exports = {

    /* Enables the user to send his video, finds who wins the duel
    and notifies the 2 users */
    async participateDuel(req, res) {

        /* The user went to the end of the participation process, we can consider his last upload as the right one
        We get the right column name to update and we initially assume the user who sent the video is the one who asked for the duel
        */
        let [video_path_name, video_temporary_path_name, video_path_to_check] = ['user_asking_duel_path', 'user_asking_duel_temporary_path', 'user_asked_duel_path']

        const userId = req.body.userId
            
        try {

            const duel = await findOneDuel(req.body.id) 

            if (userId === duel.user_asked_id) {
            // Actually, the user who just participated is the one who received the duel request
                [video_path_name, video_temporary_path_name, video_path_to_check] = ['user_asked_duel_path', 'user_asked_duel_temporary_path', 'user_asking_duel_path']
            }

            // This is the data to update the duel with the users' scores, and the last video sent by the user becomes the permanent video that will be considered for this duel
            let duelData = {
                ...req.body,
                [video_path_name]: duel[video_temporary_path_name],
            }

            /* The duel can be closed if both users have sent their videos
            the check can be done only on the other user as we already know the current user has just sent his video
            */
            if (duel[video_path_to_check]) {
                duelData.closed = true
            }

            await duel.update(duelData)

            const [userAsking, userAsked] = await findDuelUsers(duel)
            if(!userAsking || !userAsked) {
                throw new Error('Something went wrong while getting users participating to the duel')
            }

            if(!duel.closed) {
                res.json({duel: duel})
                sendDuelPushNotification('VideoSent', duel, userAsking, userAsked, duel.user_asked_duel_path)
            } else {

                const [victoryPoint, victoryFootcoin, lossPoint, lossFootcoin, drawPoint, drawFootcoin] = await createMainElements()
                const [winner, loser, scoreWinner, scoreLoser] = await updateData(duel, userAsking, userAsked, victoryPoint, victoryFootcoin, lossPoint, lossFootcoin, drawPoint, drawFootcoin)

                res.json({duel: duel, userAsking: userAsking, userAsked: userAsked})

                // Sends push and emails notifications to both user to let them know the result
                sendDuelPushNotification('Result', duel, userAsking, userAsked)
                sendFinalEmailNotification(duel, winner, scoreWinner, loser, scoreLoser)             
            }  

        } catch(err) {
            console.log(err)
            res.status(500).json(err)
        }
    },

  
  /* Enables the user to answer the duel request and
  notifies by email the other user*/  
  async answerDuel(req, res) {
    
    try {

      const duel = await findOneDuel(req.body.id)
      await duel.update(req.body)

      // Sends a notification to the asking user
      if(duel.status_id===2) {
        sendDuelPushNotification('Answer', duel, duel.userAsking, duel.userAsked, false, true)
        sendAnswerEmailNotification(duel, true)
      } else {
        duel.update({closed: true})
        sendDuelPushNotification('Answer', duel, duel.userAsking, duel.userAsked, false, false)
        sendAnswerEmailNotification(duel, false)
      }

    } catch(err) {
      console.log(err)
      res.status(500).json(err)
    }
  },

  /* Creates a duel request and sends push/email notifications
  to the other user */
  async requestDuel(req, res) {
    let duelData = req.body,
      users = []
     
    try {
      const challenge = await Challenge.findOne({
        where: {id: req.body.challenge_id}
      })

      duelData['challenge_category_id'] = challenge.challenge_category_id
      const createdDuel = await Duel.create(duelData)

      const duel = await Duel.findByPk(createdDuel.id, {
        include : [
          {model: User, as: 'userAsking'},
          {model: User, as: 'userAsked'}
        ]
      })

      res.json(duel.id)

      // Sends a push and email notifications to the user who has been asked for a duel
      users.push(duel.userAsked)
      sendDuelPushNotification('Request', duel, duel.userAsking, duel.userAsked)    
      sendRequestEmailNotification(duel.userAsking, duel.userAsked, challenge, duel)      

    } catch(err) {
      console.log(err)
      res.status(500).json(err)
    }
  },

  // Gets all users' requests duels
    async getDuels(req, res) {
        try {
            const statusId = parseInt(req.params.statusId),
                closed = parseInt(req.params.closed),
                limit = parseInt(req.params.size),
                offset = limit * parseInt(req.params.page)  

        // Builds the query used while finding the duel in the db
            let dataQuery = buildQuery(req.params.userId, statusId, limit, offset, closed)
            const duels = await Duel.findAll(dataQuery)

            res.json(duels)

        } catch(err) {
            console.log(err)
            res.status(500).json(err)
        } 
    },

  /* Gets a specific duel thanks to its id*/
  async getOneDuel(req, res) {

    try {
    const duel = await Duel.findByPk(req.params.id, {
      include : [
        {model: User, as: 'userAsking', include: [{model: Player}]},
        {model: User, as: 'userAsked', include: [{model: Player}]},
        {model: DuelResult, as: 'result'},
        {model: DuelStatus, as: 'status'},
        {model: Challenge},
      ],
    })

      res.json(duel)

    } catch(err) {
      console.log(err)
      res.status(500).json(err)
    } 
  },
}


// Gets all the information about the duel 
async function findOneDuel (id) {

  try {
  const duel = await Duel.findByPk(id, {
    include : [
      {model: User, as: 'userAsking', include: [{model: Player}]},
      {model: User, as: 'userAsked', include: [{model: Player}]},
      {model: DuelResult, as: 'result'},
      {model: DuelStatus, as: 'status'},
      {model: Challenge},
    ]
  })

    return duel

  } catch(err) {
    console.log(err)
    return null
  } 
}

// Defines how to update the duel information and the users points
async function updateData(duel, userAsking, userAsked, victoryPoint, victoryFootcoin, lossPoint, lossFootcoin, drawPoint, drawFootcoin) {
  let winner = "",
    loser = "",
    scoreLoser = "",
    scoreWinner = ""

  try {
    if(duel.user_asking_score > duel.user_asked_score) {
      await updateUsersPoints(duel, userAsking, userAsked, 2, victoryPoint, victoryFootcoin, lossPoint, lossFootcoin)     
      updateDuelSummary(duel, userAsking.id, victoryPoint, victoryFootcoin)

      if(lossPoint>0 || lossFootcoin>0) {
        updateDuelSummary(duel, userAsked.id, lossPoint, lossFootcoin)
      }
      
      winner = duel.userAsking
      loser = duel.userAsked
      scoreWinner = duel.user_asking_score
      scoreLoser = duel.user_asked_score  

    } else if(duel.user_asking_score < duel.user_asked_score) {
      await updateUsersPoints(duel, userAsking, userAsked, 3, lossPoint, lossFootcoin, victoryPoint, victoryFootcoin)      
      updateDuelSummary(duel, userAsked.id, victoryPoint, victoryFootcoin)

      if(lossPoint>0 || lossFootcoin>0) {
        updateDuelSummary(duel, userAsking.id, lossPoint, lossFootcoin)
      }      

      winner = userAsked;
      loser = userAsking;
      scoreWinner = duel.user_asked_score;
      scoreLoser = duel.user_asking_score;

    } else {
      await updateUsersPoints(duel, userAsking, userAsked, 1, drawPoint, drawFootcoin, drawPoint, drawFootcoin)
      updateDuelSummary(duel, userAsking.id, drawPoint, drawFootcoin)
      updateDuelSummary(duel, userAsked.id, drawPoint, drawFootcoin)
    }

    return [winner, loser, scoreWinner, scoreLoser]

  } catch(err) {
    console.log(err)
  }
}

// Updates the users points depending on their scores on the duel
async function updateUsersPoints(duel, userAsking, userAsked, resultId, userAskingPoint, userAskingFootcoin, userAskedPoint, userAskedFootcoin) {
  const originName = "Duel"

  try {

      await duel.update({
        result_id: resultId,
        user_asking_point: userAskingPoint,
        user_asking_footcoin: userAskingFootcoin,
        user_asked_point: userAskedPoint,
        user_asked_footcoin: userAskedFootcoin
      })

      // Updates the users' total points and footcoins
      await userAsking.player.update({
        total_point: userAsking.player.total_point + userAskingPoint,
        total_footcoin: userAsking.player.total_footcoin + userAskingFootcoin
      })

      await userAsked.player.update({
        total_point: userAsked.player.total_point + userAskedPoint,
        total_footcoin: userAsked.player.total_footcoin + userAskedFootcoin
      })  

      /* We update both users' points & footcoins earning due to the
      duel result */
      EarningController.updateOrCreate(userAsking.id, originName, userAskingPoint, userAskingFootcoin)
      EarningController.updateOrCreate(userAsked.id, originName, userAskedPoint, userAskedFootcoin)

  } catch(err) {
    console.log(err)
  }
}

/* Updates the duel summary table which summarizes the 
users's points and footcoins earned for each duel */
async function updateDuelSummary(duel, userId, userPoint, userFootcoin) {

  try {
    const duelSummary = await DuelSummary.findOrCreate({
      where: {
        user_id: userId,
        challenge_id: duel.challenge_id,
      }, defaults: {
        point: userPoint,
        footcoin: userFootcoin,
        challenge_category_id: duel.challenge_category_id
      }
    })

    if(duelSummary[1]===false) {
      duelSummary[0].update({
        point: duelSummary[0].point + userPoint,
        footcoin: duelSummary[0].footcoin + userFootcoin                
      })
    }
  } catch(err) {
    console.log(err)
  }
}

// Finds the 2 users involved in the duel
async function findDuelUsers(duel) {

    try {
        const includeQuery = UserController.buildIncludeQuery(rolesNames.player)
        
        const [userAsking, userAsked] = await Promise.all([
            User.findByPk(duel.user_asking_id, {
                include: includeQuery
            }),
            User.findByPk(duel.user_asked_id, {
                include: includeQuery
            })                   
        ])

        return  [userAsking, userAsked]

    } catch(err) {
        console.log(err)
        return null
    }
}

// Builds the sql query used to find the duel
function buildQuery(userId, statusId, limit, offset, closed) {
  
    let dataQuery = {
        include : [
            {model: User, as: 'userAsking', include: [{model: Player}]},
            {model: User, as: 'userAsked', include: [{model: Player}]},
            {model: Challenge},
            {model: DuelStatus, as: "status"},
            {model: DuelResult, as: "result"}
        ],
        where: {
            $or: [ 
                {user_asking_id: userId},
                {user_asked_id: userId}
            ]
        },
        order: [['created_at', 'DESC']]
    }

    if(statusId) {
        dataQuery.where['status_id'] = statusId
    }
    if (closed) {
        dataQuery.where['closed'] = closed
    }
        
    if(limit) {
        dataQuery['limit'] = limit
        if(offset) {
            dataQuery['offset'] = offset
        }
    }

  return dataQuery
}

/* Creates the mains elements that will be used 
that will be used to update the users points */
async function createMainElements() {

  try { 
    const [drawDuel, victoryPoint, victoryFootcoin, lossPoint, lossFootcoin] = await Promise.all([
      DuelResult.findOne({where: {name: 'Nul'}}),
      DuelResult.max('point'),
      DuelResult.max('footcoin'),
      DuelResult.min('point'),
      DuelResult.min('footcoin')
    ]) 

    return [victoryPoint, victoryFootcoin, lossPoint, lossFootcoin, drawDuel.point, drawDuel.footcoin]

  } catch(err) {
    console.log(err)
  }
}

/* Finds out if the users already played against each other
on the same challenge */
async function findPreviousDuel(duel, userAsking, userAsked) {

  try {
    const previousDuel = await Duel.findOne({
      where: {
        $and: [
          {$or: [
            {$and: [
            {user_asking_id: userAsking.id},
            {user_asked_id: userAsked.id}
            ]},
            {$and: [
            {user_asked_id: userAsking.id},
            {user_asking_id: userAsked.id}
            ]}              
          ]},
          {challenge_id: duel.challenge_id},
          {id: {
            $ne: duel.id
          }},
          {closed: true}
        ]
      }
    })

    return previousDuel
  } catch(err) {
    console.log(err)
    return false
  }
}

// Sends a push notification to the user who has been asked for a duel
function sendDuelPushNotification(type, duel, userAsking, userAsked, userAskedVideo, positiveAnswer) {
  let users = [],
    message = {
        icon: `${originFrontURL}/images/logos/bestfootball_logo.png`,
      tag: "duel",
      data: {
        url: `${originFrontURL}/duel/participation/${duel.id}`
      },
      "content-available": 1
    }

  if(type==='Request') {
    users.push(userAsked)
    message['title'] = `${userAsking.username} veut t'affronter !`
    message['body'] = `C'est chaud ! le gars veut se mesurer à toi !`

    NotificationsController.sendPushNotification(message, users)

  } else if(type==='Answer') {
    users.push(duel.userAsking)
    sendAnswerPushNotification(users, userAsked.username, message)
  } else if(type==='Result') {
    users.push(userAsking)
    users.push(userAsked)
    message['title'] = `Duel ${userAsking.username} vs ${userAsked.username} terminé !`
    message['body'] = `Viens vite sur BF checker qui a gagné !`

    NotificationsController.sendPushNotification(message, users)

  } else {
    sendParticipationPushNotification(userAsking, userAsked, message, userAskedVideo)    
  }
}

// Sends a push notificaiton to the asking user to let him know the other user decision
function sendAnswerPushNotification(userAsking, userAskedUsername, message, positiveAnswer) {

  if(positiveAnswer) {
    message['title'] = `${userAskedUsername} est prêt à t'affronter !`
    message['body'] = `C'est chaud ! Faut assumer maintenant !`   
  } else {
    message['title'] = `${userAskedUsername} a refusé un duel !`
    message['body'] = `Tu lui fais peur tu crois ?! Défie-le sur un autre challenge !`
    message['data']['url'] = `${originFrontURL}/duel/request/${userAskedUsername}`
  }

  NotificationsController.sendPushNotification(message, userAsking)     
}


/* Sends a message to warn the user that his opponent has just sent
his video. This function ill be called only if one of the users has not sent his video yet */
function sendParticipationPushNotification(userAsking, userAsked, message, userAskedVideo) {
  let users = []

  if(userAskedVideo) {
    users.push(userAsking)
    message['title'] = `${userAsked.username} a envoyé sa vidéo !`
    message['body'] = `Envoie aussi ta vidéo qu'on voit qui est le plus chaud !`

    NotificationsController.sendPushNotification(message, users)            
  } else {
    users.push(userAsked)
    message['title'] = `${userAsking.username} a envoyé sa vidéo !`
    message['body'] = `T'attends quoi ? Montre-lui ton level !`

    NotificationsController.sendPushNotification(message, users)            
  }  
}

// Defines which email to send to both users depending on the duel result
function sendFinalEmailNotification(duel, winner, scoreWinner, loser, scoreLoser) {
  let subject, templateId

  if(winner!="") {
    subject = "{{var:winner}}, ton duel contre {{var:loser}} est terminé regarde qui a gagné !"
    templateId = 275819
    sendVictoryEmailNotification(duel, winner, winner, scoreWinner, loser, scoreLoser, subject, templateId)

    subject = "{{var:loser}}, ton duel contre {{var:winner}} est terminé regarde qui a gagné !"
    templateId = 275843
    sendVictoryEmailNotification(duel, loser, winner, scoreWinner, loser, scoreLoser, subject, templateId)

  } else {
    sendDrawEmailNotification(duel, duel.userAsking, duel.user_asking_score, duel.userAsked)
    sendDrawEmailNotification(duel, duel.userAsked, duel.user_asked_score, duel.userAsking)
  }  
}

// Sends the final email to the user when there is one of the user who won
 function sendVictoryEmailNotification(duel, user, winner, scoreWinner, loser, scoreLoser, subject, templateId) {
  const request = mailjet
  .post("send", {'version': 'v3.1'})
  .request({
    "Messages": [
      {
        "From": {
          "Email": "jeremie.karege@bestfootball.fr",
          "Name": "BestFootball - Jérémie"
        },
        "To": [
          {
            "Email": user.email,
            "Name": user.username
          }
        ],
        "TemplateID": templateId,
        "TemplateLanguage": true,
        "Subject": subject,
        "Variables": {
          "loser": loser.username,
          "winner": winner.username,
          "challenge": duel.challenge.name,
          "scoreWinner": scoreWinner,
          "scoreLoser": scoreLoser,
          "urlHome": originFrontURL,
            "thumbnail": `${originFrontURL}/${process.env.PUBLIC_FOLDER_NAME}/images/challenges/presentations/${duel.challenge.thumbnail_path}`,
          "urlDuel": `${originFrontURL}/duel/participation/${duel.id}`,
          "urlNewDuel": `${originFrontURL}/duel/request/${loser.username}`
        }
      }
    ]
  })
 }

// Sends the final email to the user when the duel ends up in a draw
function sendDrawEmailNotification(duel, user, userScore, userAgainst) {
  const request = mailjet
  .post("send", {'version': 'v3.1'})
  .request({
    "Messages":[
      {
        "From": {
          "Email": "jeremie.karege@bestfootball.fr",
          "Name": "BestFootball - Jérémie"
        },
        "To": [
          {
            "Email": user.email,
            "Name": user.username
          }
        ],
        "TemplateID": 275830,
        "TemplateLanguage": true,
        "Subject": "{{var:user}}, ton duel contre {{var:userAgainst}} est terminé regarde qui a gagné !",
        "Variables": {
          "user": user.username,
          "userAgainst": userAgainst.username,
          "challenge": duel.challenge.name,
          "score": userScore,
          "urlHome": originFrontURL,
          "thumbnail": `${originFrontURL}/images/challenges/presentations/${duel.challenge.thumbnail_path}`,
          "urlDuel": `${originFrontURL}/duel/participation/${duel.id}`,
          "urlNewDuel": `${originFrontURL}/duel/request/${userAgainst.username}`
        }
      }
    ]
  })  
}

// Sends an email to the user who has been asked for a duel
function sendRequestEmailNotification(userAsking, userAsked, challenge, duel) {
  const request = mailjet
  .post("send", {'version': 'v3.1'})
  .request({
    "Messages":[
      {
        "From": {
          "Email": "jeremie.karege@bestfootball.fr",
          "Name": "BestFootball"
        },
        "To": [
          {
            "Email": userAsked.email,
            "Name": userAsked.username
          }
        ],
        "TemplateID": 275797,
        "TemplateLanguage": true,
        "Subject": "{{var:userAsked}}, {{var:userAsking}} te lance un défi sur le challenge {{var:challenge}}",
        "Variables": {
          "userAsked": userAsked.username,
          "userAsking": userAsking.username,
          "challenge": challenge.name,
          "thumbnail": `${originFrontURL}/images/challenges/presentations/${challenge.thumbnail_path}`,
          "url": `${originFrontURL}/duel/participation/${duel.id}` ,
          "urlHome": originFrontURL
        }
      }
    ]
  }) 
}

function sendAnswerEmailNotification(duel, positiveAnswer) {
  let requestData 

  if(positiveAnswer) {
    requestData = {
      "Messages":[
        {
          "From": {
            "Email": "jeremie.karege@bestfootball.fr",
            "Name": "BestFootball - Jérémie"
          },
          "To": [
            {
              "Email": duel.userAsking.email,
              "Name": duel.userAsking.username
            }
          ],
          "TemplateID": 275814,
          "TemplateLanguage": true,
          "Subject": "{{var:userAsking}}, {{var:userAsked}} est prêt à t'affronter !",
          "Variables": {
            "userAsking": duel.userAsking.username,
            "userAsked": duel.userAsked.username,
            "challenge": duel.challenge.name,
            "urlHome": originFrontURL,
            "thumbnail": `${originFrontURL}/images/challenges/presentations/${duel.challenge.thumbnail_path}`,
            "url": `${originFrontURL}/duel/participation/${duel.id}`
          }
        }
      ]
    }

  } else {
    requestData = {
      "Messages":[
        {
          "From": {
            "Email": "jeremie.karege@bestfootball.fr",
            "Name": "BestFootball - Jérémie"
          },
          "To": [
            {
              "Email": duel.userAsking.email,
              "Name": duel.userAsking.username
            }
          ],
          "TemplateID": 275825,
          "TemplateLanguage": true,
          "Subject": "{{var:userAsking}}, {{var:userAsked}} préfère éviter ce duel pour l'instant",
          "Variables": {
            "userAsking": duel.userAsking.username,
            "userAsked": duel.userAsked.username,
            "challenge": duel.challenge.name,
            "urlHome": originFrontURL,
            "thumbnail": `${originFrontURL}/images/challenges/presentations/${duel.challenge.thumbnail_path}`,
            "urlPlayer": `${originFrontURL}/player/profile/${duel.userAsked.username}`,
            "urlNewDuel": `${originFrontURL}/duel/request/${duel.userAsked.username}` ,
          }
        }
      ]
    }
  }

  const request = mailjet
  .post("send", {'version': 'v3.1'})
  .request(requestData)
}