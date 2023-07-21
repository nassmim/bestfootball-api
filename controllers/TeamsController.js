'use strict'

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env]
const rolesNames = config.roles

const models = require('../models')
const User = models.user
const Player = models.player
const Club = models.club
const Coach = models.coach
const Team = models.team
const TeamUser = models.team_user
const PlayerCategory = models.player_category
const PlayerPrice = models.player_price
const Position = models.player_position
const Season = models.season

const MainController = require('../controllers/MainController')
const NotificationsController = require('../controllers/NotificationsController')

const originFrontURL = `${process.env.FRONT_PROTOCOL}://${process.env.FRONT_DOMAIN}`


module.exports = {

  // Enables the user to add a new team 
  async addTeam(req, res) {
    const teamData = req.body,
      teamId = teamData.team_id,
      clubId = teamData.club_id,
      clubName = teamData.club_name,
      teamName = teamData.name,
      categoryId = teamData.player_category_id,
      seasonId = teamData.season_id,
      coachEmail = teamData.coach_email,
      isUpdating = teamData.isUpdating,
      uniqueName = `${clubName}_${categoryId}_${seasonId}_${teamName}`

    const numberPlayersAllowed = teamData['number_players_allowed'] = parseInt(teamData['number_players_allowed']) ? parseInt(teamData['number_players_allowed']) : 0
    let user, team, customerId
    /* This will be used in the front-end to check if a team 
    lready exists while the user tries to register a new one */
    teamData['unique_name'] = uniqueName

    try {

      if(clubId && coachEmail) {
      /* The user is a club and indicates which coach will manage 
      the team */
        user = await createCoach(coachEmail, teamData)
        if(user && user.emailAlreadyTaken) {
          return res.json(user)
        }
      }

      // Makes sure to get the right data before creating/updating the team
      const updateDone = await updateTeamData(clubId, teamData, clubName)

      let club = {}
      if(isUpdating) {
        team = await Team.findByPk(teamId)
        club = await changeSubscription(clubId, teamData, team)

        if(club && team.number_players_allowed!==numberPlayersAllowed) {
          const diffNumberPlayers = numberPlayersAllowed - team.number_players_allowed
          club.update({total_number_players_allowed: club.total_number_players_allowed + diffNumberPlayers})
        }

        await team.update(teamData)

      } else {
        club = await changeSubscription(clubId, teamData)
        team = await Team.create(teamData)

        if(club) {
          club.update({total_number_players_allowed: club.total_number_players_allowed + numberPlayersAllowed})
        }        
      }

      res.json(true) 

    } catch(err) {
      console.log(err)
      res.status(500).json(err)
    }  

    // This sends the notification to the coach
    if(clubId && coachEmail) {
      prepareNotification({
        user: user,
        team: team,
        clubName: clubName,
        categoryId: categoryId,
        typeOperation: 'coachAdd'
      })
    }      
  },

    /* Gets either one specific team, the user's teams
    or all the teams on our app */
    async getTeams(req, res) {

        const teamIdentifier = decodeURIComponent(req.params.teamIdentifier),
            userId = parseInt(req.params.userId),
            roles = req.params.roles

        const includeQuery = MainController.buildIncludeQuery('team')

        let team, teams, whereQuery = {}

        try { 
            
            // Checks if there is a team id or name indicated in the request params
            if (teamIdentifier && teamIdentifier !== 'all' && teamIdentifier != 'undefined' && teamIdentifier != 'null') {
            // The user has specified a identifier so we get the associated team

                team = await Team.findOne({
                    include: includeQuery,
                    where: {
                        $or: [
                            {id: teamIdentifier},
                            {unique_name: teamIdentifier},
                        ]
                    }
                })
            } 

            if(userId) {
            // A user's id has been defined in the request, so we need to get all the teams where this user associated to the id is involved

                if (roles.includes(rolesNames.player)) {
                // The user whose teams are requested is a player, we need to include several models to reach the player model and indicate the player's id to match

                    teams = await Team.findAll({
                        include: [
                            {model: TeamUser, required: true, include: [
                                {model: User, required: true, include: {model: Player, where: {id: userId}}},
                                { model: Position }
                            ]},
                            { model: Club, include: { model: User } },
                            { model: Coach, include: { model: User } },
                            { model: PlayerCategory },
                            { model: Season }                             
                        ]
                    })
                
                } else {
                // The user whose teams are requested is either a coach or a club, the team model includes the coach and club models so we can specify the id to match on without additional models to include

                    teams = await Team.findAll({
                        include: includeQuery,
                        where: {
                            $or: [
                                {coach_id: userId},
                                {club_id: userId},
                            ]
                        }
                    })
                }

            } else if (teamIdentifier == 'undefined' || teamIdentifier === 'all') {
                // Gets all available teams
                teams = await Team.findAll({
                    include: includeQuery
                })
            }

            res.json({team: team, teams: teams})

        } catch(err) {
            console.log(err)
            res.status(500).json(err)
        }
    },


  // Removes the team
  async removeTeam(req, res) {
    const clubId = parseInt(req.params.clubId)

    try {

      if(clubId) {

        const club = await Club.findByPk(clubId)
        const team = await Team.findByPk(req.params.teamId)
        const newNumberPlayer = club.total_number_players_allowed - team.number_players_allowed
        club.update({total_number_players_allowed: newNumberPlayer})

        if(club.customer_id) {

          const maxNumberPlayers = await PlayerPrice.max('number_players')

          if(newNumberPlayer > 0 && newNumberPlayer < maxNumberPlayers) {
            const subscription = await stripe.subscriptions.retrieve(club.subscription_id).catch(err => {throw new Error(err)})
            stripe.subscriptions.update(club.subscription_id, {
                items: [{
                  id: subscription.items.data[0].id,
                  quantity: newNumberPlayer
                }]
            })          
          }         
        }
      }

      Team.destroy({force: true, where: {id: req.params.teamId}})
      res.json(true)

    } catch(err) {
      console.log(err)
      res.status(500).json(err)      
    }
  },


  async addTeamPlayer(req, res) {
    const teamId = req.body.team_id,
      userId = req.body.user_id

    try {

      await TeamUser.findOrCreate({
        where: {
          user_id: req.body.user_id,
          team_id: teamId,
        },
        defaults: { 
          player_position_id: req.body.position_id
        }        
      })

      await this.countTeamPlayers(teamId)

      res.json(true)

    } catch(err) {
      console.log(err)
      res.status(500).json(err)      
    }

    prepareNotification({
      userId: userId,
      teamId: teamId,
      typeOperation: 'playerAdd'
    })
  },


  async removeTeamPlayer(req, res) {
    const teamId = req.params.teamId,
      userId = req.params.userId

    try {

      await TeamUser.destroy({force: true, 
        where: {
          user_id: userId,
          team_id: teamId,
        }
      })

      await this.countTeamPlayers(teamId)

      res.json(true)

    } catch(err) {
      console.log(err)
      res.status(500).json(err)      
    } 

    prepareNotification({
      userId: userId,
      teamId: teamId,
      typeOperation: 'playerRemoval'
    }) 
  },

  // Gets the number of players in the team
  async countTeamPlayers(teamId) {

    try {
      /* It could be done more easily getting the team.number_players
      but this way, it prevents from front-end misbehavior
      with an increase of the number while adding twice the same
      player for example */
      const teamUsers = await TeamUser.findAll({
        where: {team_id: teamId}
      })

      await Team.update({number_players_added: teamUsers.length}, {
        where: {id: teamId}
      })

    } catch(err) {
      console.log(err)
    }
  }
}

// This associates the coach to the  team
async function createCoach(coachEmail, teamData) {

  let user, initialPassword = ''

  try {
    user = await User.findOne({
      where: {email: coachEmail},
      include: [
        {model: Player},
        {model: Coach},
        {model: Club}
      ]
    })
    
    if(user) {

      /* The user already exists, the club can't assign him a team */
        return {emailAlreadyTaken: true}

    } else {
      /* The user doesn't exist, therefore we can proceed to the 
      creation of the coach */
      const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
      const charactersLen = characters.length

      // This creates a random 6-digit password
      for(let i=0;i<6;i++) {
        initialPassword += characters[Math.floor(Math.random() * Math.floor(charactersLen))] 
      }

      const [hashedPassword, token] = [utils.hashPassword(initialPassword), Math.random().toString(36).substr(2, 18)],
        password = hashedPassword.hash,
        salt = hashedPassword.salt

        user = await User.create({
            username: coachEmail,
            email: coachEmail,
            password: password,
            salt: salt,
            token: token,
            roles: rolesNames.coach,
            activated: true
        })

      /* This will be used in the front-end to check if the
      user has changed his password as we don't want him to keep
      the one we sent to him for security reasons */
      user['initialPassword'] = initialPassword

      const coach = await Coach.create({
        user_id: user.id,
        belongs_to_club: true,
        initial_password: password,
      })

      teamData['coach_id'] = coach.id

      return user
    }

  } catch(err) {
    console.log(err)
    throw new Error(err)
  }
}

// Sets up the data that will be used for the creation/edition of the team
async function updateTeamData(clubId, teamData, clubName) {

  try {

    if(clubId) {
      teamData['registered_by_club'] = true
    } else {
      teamData['activated'] = true
      /* The team has been added by a independant coach, so
      we need to find or create his club based on the name
      he provided */
      const club = await Club.findOrCreate({
        where: {name: clubName},
      })

      teamData['club_id'] = club[0].id
    }

    return true

  } catch(err) {
    console.log(err)
    throw new Error(err)    
  }
}

// This updates the club subscription if it already had one
async function changeSubscription(clubId, teamData, team) {

  try {

    if(clubId) {

      const club = await Club.findByPk(clubId)

      if(club.customer_id) {

        if(team && team.number_players_added<=teamData.number_players_allowed || !team) {
          teamData['activated'] = true
        } else {
          teamData['activated'] = false
        }
        
        const maxNumberPlayers = await PlayerPrice.max('number_players')
        const currentTeamNumberPlayers = team && team.id ? team.number_players_allowed : 0
        const requestTeamNumberPlayers = teamData['number_players_allowed']
        const newNumberPlayer = club.total_number_players_allowed + requestTeamNumberPlayers - currentTeamNumberPlayers

        if(newNumberPlayer > 0 && (club.total_number_players_allowed < maxNumberPlayers || newNumberPlayer < maxNumberPlayers)) {
          const subscription = await stripe.subscriptions.retrieve(club.subscription_id)
        /* The only cases where we need to update the plan are:
        1- the number of player already registered is not higher than the limit, 
        therefore increasing or decreasing the number of players necessarily entail a price difference
        2- the number of players already registered is higher than the limit, 
        therefore the price will change only if the new number of players to register
        is now lower than the limit */
          stripe.subscriptions.update(club.subscription_id, {
              items: [{
                id: subscription.items.data[0].id,
                quantity: newNumberPlayer
              }]
          })          
        }
      }

      return club

    } else {
      return false
    }
  } catch(err) {
    console.log(err)
  }
}

// This sends the notification to the user depeding on the type of operation
async function prepareNotification(object) {
  let user, team, coachName, clubName

  try {

    switch(object.typeOperation) {
      case 'playerAdd':
        [user, team, coachName, clubName] = await buildDataForPlayerAdding(object.userId, object.teamId)
        sendPushNotificationToPlayerAdded(user, team, coachName, true)
        sendEmailToPlayerAdded(user, team, coachName, clubName)
        break

      case 'playerRemoval':
        [user, team, coachName] = await buildDataForPlayerAdding(object.userId, object.teamId)
        sendPushNotificationToPlayerAdded(user, team, coachName)
        break   

      case 'coachAdd':
        [user, clubName, team] = [object.user, object.clubName, object.team]
        const category = await PlayerCategory.findByPk(object.categoryId)
        team['categoryName'] = category.name
        sendPushNotificationToCoachAdded(user, clubName, team)
        sendEmailToCoachAdded(user, clubName, team)      
        break         
    }

  } catch(err) {
    console.log(err)    
  }
}

// This sends the notification to the user depeding on the type of operation
async function buildDataForPlayerAdding(userId, teamId) {

    try {
        const team = await Team.findByPk(teamId)
        const [user, coach, club] = await Promise.all([
            User.findByPk(userId),
            Coach.findOne({where: {id: team.coach_id}}),
            Club.findOne({where: {id: team.club_id}})
        ])
        
        const coachName = coach.first_name ? coach.first_name : 'Your team'

        return [user, team, coachName, club.name]

    } catch(err) {
        throw new Error(err)    
    }
}

// Sends a push notification to the user who has been added as a coach
function sendPushNotificationToCoachAdded(user, clubName, team) {
  let users = []
  const message = {
    title: `${clubName} needs you!`,
    body: `Team '${team.name}', ${team.categoryName}!`,
      icon: `${originFrontURL}/images/logos/bestfootball_logo.png`,
    tag: "new-team",
    data: {
      url: `${originFrontURL}/login`
    },
    "content-available": 1
  }

  users.push(user)
  NotificationsController.sendPushNotification(message, users)
}


// Sends a push notification to the user who has been added to the team
function sendPushNotificationToPlayerAdded(user, team, coachName, addedOperation) {
  let users = []

  let message = {
      icon: `${originFrontURL}/images/logos/bestfootball_logo.png`,
    tag: "team-player",
    "content-available": 1
  }

  if(addedOperation) {
    message['title'] = `${coachName} needs you!`
    message['body'] = `${coachName} adds you in his team '${team.name}' !`
    message['data'] = {
      url: `${originFrontURL}/my-team/${team.unique_name}`
    }
  } else {
    message['title'] = `${coachName} removed you!`
    message['body'] = `${coachName} removed you from '${team.name}' !`    
    message['data'] = {
      url: `${originFrontURL}/profile/${user.username}`
    }    
  }

  users.push(user)
  NotificationsController.sendPushNotification(message, users)
}

// Sends a email to the new coach who's gonna manage the team
function sendEmailToCoachAdded(user, clubName, team) {

  let request
  if(user.initialPassword) {
    request = mailjet
    .post("send", {'version': 'v3.1'})
    .request({
      "Messages":[{
        "From": {
          "Email": "noreply@bestfootball.fr",
          "Name": "BestFootball Team"
        },
        "To": [{
          "Email": user.email,
          "Name": "BestFootball"
        }],
        "TemplateID": 731295,
        "TemplateLanguage": true,
        "Subject": "{{var:clubName}} added you!",
        "Variables": {
          "clubName": clubName,
          "identifier": user.email,
          "password": user.initialPassword,
          "teamName": team.name,
          "categoryName": team.categoryName,
          "url": `${originFrontURL}/login`
        }
      }
      ]
    })    
  } else {
      request = mailjet
      .post("send", {'version': 'v3.1'})
      .request({
        "Messages":[{
          "From": {
            "Email": "noreply@bestfootball.fr",
            "Name": "BestFootball Team"
          },
          "To": [{
            "Email": user.email,
            "Name": "BestFootball"
          }],
          "TemplateID": 731641,
          "TemplateLanguage": true,
          "Subject": "{{var:clubName}} added you!",
          "Variables": {
            "clubName": clubName,
            "teamName": team.name,
            "categoryName": team.categoryName,
            "url": `${originFrontURL}/login`
          }
        }
        ]
      })    
  }
}

// Sends a email to the player who receives the request to join the team
function sendEmailToPlayerAdded(user, team, coachName, clubName) {

  const request = mailjet
  .post("send", {'version': 'v3.1'})
  .request({
    "Messages":[{
      "From": {
        "Email": "noreply@bestfootball.fr",
        "Name": "BestFootball Team"
      },
      "To": [{
        "Email": user.email,
        "Name": "BestFootball"
      }],
      "TemplateID": 740180,
      "TemplateLanguage": true,
      "Subject": "{{var:username}}, {{var:coachName}} needs you!",
      "Variables": {
        "coachName": coachName,
        "username": user.username,
        "clubName": clubName,
        "teamName": team.name,
        "categoryName": team.categoryName,
        "url": `${originFrontURL}/team/${team.unique_name}`
      }
    }]
  })    
}