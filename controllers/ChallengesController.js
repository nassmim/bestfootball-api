'use strict';
const models = require('../models') 

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env]
const rolesNames = config.roles

const Challenge = models.challenge
const ChallengeVideo = models.challenge_video
const ChallengeTutorial = models.challenge_tutorial
const ChallengeCategory = models.challenge_category
const CoachExerciceModule = models.coach_exercice_module
const ChallengeScoreFederation = models.challenge_score_federation
const ChallengeStep = models.challenge_step
const Player = models.player
const User = models.user
const TeamUser = models.team_user
const StepUsualPoint = models.step_usual_point
const Team = models.team
const PlayerCategory = models.player_category 
const Position = models.player_position 

const UserController = require('../controllers/UserController')
const RankingController = require('../controllers/RankingController')
const UploadController = require('../controllers/UploadController')
const NotificationsController = require('../controllers/NotificationsController')
const MainController = require('../controllers/MainController')

const originFrontURL = `${process.env.FRONT_PROTOCOL}://${process.env.FRONT_DOMAIN}`

module.exports = {

  // Get challenges depending on the selected filters by the user
  async getChallenges(req, res) {
    const name = decodeURIComponent(req.params.name),
      teamsIds = req.params.teamsIds,
      seasonId = parseInt(req.params.seasonId),
      ageCategoryId = parseInt(req.params.ageCategoryId),
      categoryId = parseInt(req.params.categoryId),
      limit = parseInt(req.params.size),
      offset = limit * parseInt(req.params.page),
      order = req.params.order

    let response = {}

    const [oneChallenge, multipleChallenges, dataQuery] = this.buildQuery(name, teamsIds, seasonId, ageCategoryId, categoryId, limit, offset, order, 'Challenge')

    try {

      if(oneChallenge) {

        const newDataQuery = Object.assign({}, dataQuery)
        newDataQuery['where'] = {
          name: name
        }

        response['challenge'] = await Challenge.findAll(newDataQuery)
      } 

      if(multipleChallenges || req.params.categoryId==='all') {
        delete dataQuery['where']['name']

        if(teamsIds && parseInt(teamsIds[0]) && teamsIds.length>1) {
          delete dataQuery['limit']
          delete dataQuery['offset']
          response['challenges'] = await Challenge.findAll(dataQuery)          
          this.getUniquesFromCoach(response, 'challenges', limit, offset)

        } else {
          response['challenges'] = await Challenge.findAll(dataQuery)
        }
      }

      res.json(response)

    } catch(err) {
      console.log(err)
      res.status(500).json(err)
    }    
  },

    // Builds the query that must be used to get the challenges
    buildQuery(name, teamsIds, seasonId, ageCategoryId, categoryId, limit, offset, order, type, challengeId, userId) {

        let whereTeam = {}
        
        const oneVideo = name!=='all' ? true : false,
            multipleVideos = categoryId ? true : false,
            mainFilters = {
                activated: true,
                user_id: userId,
                challenge_category_id: categoryId,
                challenge_id: challengeId,
            }

        let whereQuery = MainController.getOnestepFiltersValues(mainFilters)

        let dataQuery

        switch(type) {
            case 'Challenge': 
                dataQuery = {
                    include:[
                        {model: User},
                        {model: ChallengeTutorial},
                        {model: ChallengeCategory},
                        {model: ChallengeStep},
                        {model: ChallengeScoreFederation}
                    ]
                }
                break

            case 'ChallengeTutorial':
                dataQuery = {
                    include:[
                        {model: User},
                        {model: Challenge},
                        {model: ChallengeCategory}
                    ]
                }      
                break 

            case 'ChallengeVideo':
                delete whereQuery.activated
                dataQuery = {
                    include:[
                        {model: User, required: true, include: {model: Player, required: true}},
                        {model: Challenge, required: true},
                        {model: ChallengeCategory}
                    ]
                }      
                break        

            case 'CoachExercice':
                delete whereQuery.activated

                if(categoryId) {
                    whereQuery['coach_exercice_module_id'] = whereQuery['challenge_category_id']
                    delete whereQuery.challenge_category_id
                }
                
                dataQuery = {
                    include:[
                        {model: CoachExerciceModule},
                    ]
                }      
                break 
        }

        if(teamsIds && parseInt(teamsIds[0])) {
            // const ids = teamsIds.split(",")
            whereQuery['team_id'] = {$in: [teamsIds]}

            if(seasonId || ageCategoryId) {
                const filters = {
                    season_id: seasonId,
                    player_category_id: ageCategoryId,
                }     
                whereTeam = MainController.getOnestepFiltersValues(filters)
            } 

            whereTeam['activated'] = true 
            dataQuery['include'].push({
                model: Team, 
                where: whereTeam, 
                include: [
                    { model: TeamUser, include: [
                        { model: User, include: { model: Player } },
                        { model: Position }
                    ]},
                    { model: PlayerCategory }
                ]
            })      

        } else {
            whereQuery['team_id'] = null
            dataQuery['include'].push({
                model: Team, 
                include: [
                    { model: TeamUser },
                    { model: PlayerCategory }
                ]
            })      
        }

        dataQuery['where'] = whereQuery

        if(limit) {
            dataQuery['limit'] = limit
            if(offset) {
                dataQuery['offset'] = offset
            }
        }

        if(order==='name') {
            dataQuery['order'] = [['name', 'ASC']]
        } else {
            dataQuery['order'] = [['created_at', 'DESC']]
        }

        return [oneVideo, multipleVideos, dataQuery]  
    },


  // Remove duplicates (challenges, exercices, etc.) created for several teams 
  getUniquesFromCoach(response, data, size, offset) {
    const uniques = response[data].reduce((list, row)=> !list.map(row=> row.name).includes(row.name) ? list.concat(row) : list, [])

    if(size) {
      response[data] = uniques.slice(offset, offset + size)
    } else {
      response[data] = uniques
    }
  },


    // Gets the players scores and top ranking on a specific challenge
    async getChallengeStats(req, res) {

        const userId = parseInt(req.params.userId),
            challengeId = parseInt(req.params.challengeId),
            limit = parseInt(req.params.size)

    /*     const filtersUser = { 
        userId: {id: userId},
        gender: {}, 
        country: {} 
        },
        filtersChallenge = {
            challenge_id: challengeId,
            score: {$gt: 0}
        } */

        let response = {
            challengeId: challengeId
        }

        try {
        // gets the best users for this challenge
    /*       const rankings = await getRanking(filtersUser, filtersChallenge, limit)
        response['rankings'] = rankings */

            if(userId) {
            // The user is connected, we gets his stats on this challenge
                const [userScore, userPoints, userMaxStep] = await getUserStats(userId, challengeId)
                response['userScore'] = userScore
                response['userPoints'] = userPoints
                response['userMaxStep'] = userMaxStep

                const challenge = await Challenge.findByPk(challengeId, {
                    include: { model: ChallengeScoreFederation}
                })

                if(challenge && challenge.challenge_score_federations && challenge.challenge_score_federations.length) {
                    
                    const userDataQuery = {
                        where: {id: userId}
                    }      

                    const user = await UserController.getUser(rolesNames.player, userDataQuery)        

                    if(user.player.category_id /* && user.address && user.address.city  && user.address.country*/) {

                        const scoreFederation = await ChallengeScoreFederation.findOne({
                            where: {
                                player_category_id: user.player.category_id,
                                challenge_id: challengeId
                                // country_id: user.address.country_id
                            }
                        })

                        if(scoreFederation) {
                            response['scoreFederation'] = scoreFederation.score
                        }
                    }
                }    
            }

            res.json(response)

        } catch(err) {
            console.log(err)
            res.status(500).json(err)
        }
    },


  /* Gets the category of the challenge */
  async getCategories(identifier, model, includeModel, res) {
    const id = parseInt(identifier)
    let whereUsed

    try {

      if(id) {
        whereUsed = {id: id}
      } 

      const response = await model.findAll({
        include: [
          {model: includeModel, where: whereUsed}
        ],
        order: [['french_name', 'ASC'], ['english_name', 'ASC']]
      })

      res.json(response) 

    } catch(err) {
      console.log(err)
      res.status(500).json(err)
    }    
  },


  /* Enables user to propose us a new challenge */
  async createChallenge(req, res) {
    let challengeData = req.body
    const teamsIds = challengeData.teams_ids,
        teamsIdsLength = teamsIds ? teamsIds.length : false,
        existingChallengeId = challengeData.challenge_id_to_use

    try {

        if (teamsIdsLength) {
            
            if (existingChallengeId) {

                const firstChallenge = await Challenge.findByPk(existingChallengeId)

                challengeData = {
                    user_id: challengeData.user_id,
                    name: challengeData.name,
                    challenge_category_id: firstChallenge.challenge_category_id,
                    french_description: firstChallenge.french_description,
                    english_description: firstChallenge.english_description,
                    tutorial_video_link: challengeData.tutorial_video_link,
                    challenge_coach_reward: challengeData.challengeCoachReward,
                    bf_path: firstChallenge.bf_path,
                    levels: challengeData.levels,
                    thumbnail_path: firstChallenge.thumbnail_path,
                    from_upload: false
                }   

                for (let i = 0; i < teamsIdsLength; i++) {

                    challengeData.team_id = teamsIds[i]
                                    
                    const challenge = await Challenge.create(challengeData)
                    
                    createChallengeSteps(challengeData.levels, challenge.id)
                }

            } else {

                const firstChallenge = await Challenge.findByPk(challengeData.id)
                challengeData['thumbnail_path'] = firstChallenge['thumbnail_path']

                if (challengeData.virtualMoneyGiven) {
                    challengeData['activated'] = false
                }

                const teamsIdsLength = teamsIds.length

                for (let i = 0; i < teamsIdsLength; i++) {
                    challengeData['team_id'] = teamsIds[i]
                    await this.challengeCreation(challengeData)
                    challengeData['id'] = challengeData.id + 1
                }

                UploadController.generateThumbnail("challenges/presentations", challengeData.bf_path, challengeData.thumbnail_path)
            }

        } else {
            await this.challengeCreation(challengeData)
            UploadController.generateThumbnail("challenges/presentations", challengeData.bf_path, challengeData.thumbnail_path)
        }

        res.json(true)

    } catch(err) {
      console.log(err)
      res.status(500).json(err)
    } 
    
    this.sendEmailNotification(challengeData, 'challenge')  
  },


  /* Intermediary function to enable the user to propose us a new challenge */
  async challengeCreation(challengeData) {

    try {

        await this.createForChallenge(challengeData, Challenge)
            
        const step = await StepUsualPoint.findOne({
            where: {step: 1}
        })
        
        createChallengeSteps(challengeData.levels, challengeData.id, challengeData.virtualMoneyGiven)

        return true

    } catch(err) {
      console.log(err)
      throw new Error(err)
    }   
  },

  // Finishes the challenge or tutorial creation and gets a thumbnail
  async createForChallenge(data, model) {
    const id = data.id
    const thumbnailPath = data.bf_path.split('.')[0] + '.jpg'    
    data['thumbnail_path'] = thumbnailPath

    try {
      
      await model.update(data, {
        where: {
          id: id
        }
      })

      return true

    } catch(err) {
      throw new Error(err)
    } 
  },

  // Makes the challenge available and sends a notification to users
  acceptChallenge(req, res) {
    let message = {
      body: "Tu peux réussir ce challenge ?!",
        icon: `${originFrontURL}/images/logos/bestfootball_logo.png`,
      tag: "new-challenge",
      "content-available": 1
    }

    this.acceptForChallenge(Challenge, req.body.id, message)
  },


  // Accepts the user's challenge or tutorial proposition
  async acceptForChallenge(model, id, message) {

    const data = await model.findByPk(id)
    data.update({activated: true})

    message['title'] = `${data.name} Challenge !`
    if(model===Challenge) {
      message['data'] = {
        url: `${originFrontURL}/trainings/challenge/${data.name}`
      }
    } else {
      message['data'] = {
        url: `${originFrontURL}/trainings/tutorial/${data.name}`
      }      
    }

    let dataUser = {
      where: {
        activated: true, 
        notification_subscription_endpoint: {$ne: null}          
      }
    }

    if(data.team_id) {
      dataUser['include'] = {model: TeamUser, where: {team_id: data.team_id}}
    }

    const users = await User.findAll(dataUser)

    NotificationsController.sendPushNotification(message, users)    
  },

    // Gets all the skills status that can be obtained by a user 
    async getAllStatus(res) {

        try {
            usersStatus = await usersStatus.findAll()
            res.json(usersStatus)
        } catch (err) {
            console.log(err)
            res.status(500).json(err)
        }
    },

  // Sends a notifications to us to let us know a new challenge has been created
  sendEmailNotification(data, type) {
    const text = `New ${type} has been created: 
    
    id: ${data.id},
    name: ${data.name},
    description: ${data.french_description},
    user_id: ${data.user_id}`

    const mailOpts = {
      from: 'BestFootball notification' + '&gt;',
      to: process.env.GMAIL_USER,
      subject: `New challenge`,
      text: text
    };

    NotificationsController.emailNotification(mailOpts)  
  }            
}


// Gets the best users on this challenge
async function getRanking(filtersUser, filtersChallenge, limit) {
  // sets up the criteria used to create the ranking
  const filtersUserToUse = MainController.getTwostepFiltersValues(filtersUser)
  const modelRanked = User
  const modelUsed = ChallengeVideo
  let whereUsed = filtersChallenge
  const includeUsed = []
  const sumQueryUsed = [[models.sequelize.fn('max', models.sequelize.col('score')), 'maxScore'], [models.sequelize.fn('max', models.sequelize.col('point')), 'maxPoints']]
  const groupUsed = ['user.id']
  const orderUsed = models.sequelize.literal('maxScore DESC')
  const includeFinal = RankingController.buildRankingIncludeQuery(filtersUserToUse, modelUsed, whereUsed, includeUsed)
  const queryData = RankingController.buildRankingQuery(sumQueryUsed, includeFinal, groupUsed, orderUsed, limit)

  try {
    const rankings = await RankingController.getUsersRanking(modelRanked, queryData, filtersUserToUse['userId'].id)
    return rankings
  } catch(err) {
    console.log(err)
    return []
  }
}
 
// Gets the user's points and step he has reached on this challenge
async function getUserStats(userId, challengeId) {

  try {
    const challengeVideo = await ChallengeVideo.findOne({
      where: {
        user_id: userId,
        challenge_id: challengeId,
        is_score_max: true
      }
    })

    if(challengeVideo) {
      const [score, points] = [challengeVideo.score, challengeVideo.point]      
      const maxStep = await ChallengeStep.max('step', {
        where: {
          score:{$lte: score},
          challenge_id: challengeId
        }
      })    

      return [score, points, maxStep]

    } else {
      return [0, 0, 0]
    }
  } catch(err) {
    console.log(err)
    return [0, 0, 0]
  }
}

// Defines the number of points for each level reached
async function createChallengeSteps(levels, challengeId, virtualMoneyGiven) {
    const levelsLength = levels.length
  
    const step = await StepUsualPoint.findOne({
        where: { step: 1 }
    })

    for(let i=1;i<=levelsLength;i++) {
        // The number of points to add for each level reached is consistent
        let point = i * step.point,
            footcoin = virtualMoneyGiven ? i * step.footcoin : 0

        ChallengeStep.create({
            challenge_id: challengeId,
            point: point,
            footcoin: footcoin,
            step: i,
            score: levels[i-1]
        })
    }  
}