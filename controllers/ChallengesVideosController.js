'use strict';
const models = require('../models') 
const ChallengeVideo = models.challenge_video
const Challenge = models.challenge
const ChallengeStep = models.challenge_step
const Player = models.player
const BestSkillThreshold = models.best_skill_threshold
const User = models.user
const Club = models.club
const Coach = models.coach
const Team = models.team
const LikeGiven = models.like_given

const EarningController = require('../controllers/EarningController')
const UserController = require('../controllers/UserController')
const ChallengesController = require('../controllers/ChallengesController')
const UploadController = require('../controllers/UploadController')


module.exports = {

    /* Enables user to participate to a training challenge 
    and to earn points/footcoins */
    async participate(req, res) {

        const scoreParticipation = req.body.score,
            challengesIds = req.body.challenges_ids,
            challengeId = challengesIds[0],
            challengeCategoryId = req.body.challenge_category_id,
            userId = req.body.user_id,
            videoId = req.body.id

        let newData = req.body

        try {

            var [challenge, videoMax, video, player, bestSkillThreshold] = await createMainElements(userId, videoId, challengeId, scoreParticipation)
            var thumbnailPath = video.bf_path.split('.')[0] + '.jpg'
            
            /* Defines the number of points/footcoins associated
            to the level the user has reached */
            const [videoPoints, videoFootcoins] = challenge.challenge_steps.reduce((finalPoints, step)=> scoreParticipation >= step.score ? [step.point, step.footcoin] : finalPoints, [0, 0])
            newData['point'] = videoPoints
            newData['footcoin'] = videoFootcoins
            newData['thumbnail_path'] = thumbnailPath
            newData['challenge_id'] = challengeId
            newData['challenge_category_id'] = challengeCategoryId
            newData['team_id'] = challenge.team_id

            /* When the user uploads a video, the participation process can stop for any reason 
            and the video will remain alone in the database with no association to a user, a challenge, etc. 
            Since the user really goes until the end of the participations steps, we can enable his video so that it will be displayed in the app
            */
            newData['enable'] = true

            const [finalPoints, finalFootcoins] = await updatePlayer(userId, player, video, newData, videoMax, scoreParticipation, videoPoints, videoFootcoins, bestSkillThreshold)

            if(challenge.team_id) {

                const challengesIdsLength = challengesIds.length

                for(let i=1;i<challengesIdsLength;i++) {

                    let challengeToUse = await Challenge.findByPk(challengesIds[i], {
                        include: {model: Team}
                    })   

                    if(challengeToUse && challengeToUse.team && challengeToUse.team.activated) {
                        newData['id'] = newData.id + 1
                        newData['challenge_id'] = challengeToUse.id
                        newData['team_id'] = challengeToUse.team_id
                        await ChallengeVideo.create(newData)
                    }       
                }

                await updateCoachAndClubFootcoins(challengesIds, finalFootcoins)
            }

            res.json(video) 

        } catch(err) {
            console.log(err)
            res.status(500).json(err)
        }    

        UploadController.generateThumbnail("challenges/participations", video.bf_path, thumbnailPath)  
    },


  /* Gets either only one video or all users' ones or all the ones 
  sent by a specific user */
    async getChallengesVideos(req, res) {
        const userId = parseInt(req.params.userId),
            teamsIds = req.params.teamsIds,
            seasonId = parseInt(req.params.seasonId),
            ageCategoryId = parseInt(req.params.ageCategoryId),    
            categoryId = parseInt(req.params.categoryId),
            challengeId = parseInt(req.params.challengeId),
            videoId = parseInt(req.params.videoId),
            watched = req.params.watched,
            limit = parseInt(req.params.size),
            offset = limit * parseInt(req.params.page),
            getFullLength = req.params.getFullLength, 
            name = "all",
            order = "none"

        let response = {}

        try {

            const videos = await getAllChallengesVideos(name, teamsIds, seasonId, ageCategoryId, categoryId, limit, offset, order, 'ChallengeVideo', challengeId, userId, getFullLength)
            response['videos'] = videos

            if(videoId) {
                response['video'] = await getOneChallengeVideo(videoId, watched)
            } 

            res.json(response)

        } catch(err) {
            console.log(err)
            res.status(500).json(err)      
        }
    },


  // Gets the latest challenges videos
  async getLatestChallengesVideos(req, res) {
    const limit = parseInt(req.params.size)

    try {
      const videos = await ChallengeVideo.findAll({
        include:[
          {model: User, required: true, include: {model: Player, required: true}},
          {model: Challenge, required: true}
        ],
        order: [['id', 'DESC']],
        limit: limit
      })
    
      res.json(videos)

    } catch(err) {
      console.log(err)
      res.status(500).json(err)
    }   
  },

  async getWhoLikedVideo(req, res) {

    try {
      const likes = await LikeGiven.findAll({
        where: {
          challenge_video_id: req.params.videoId
        },      
        include: {model: User, required: true, include: [{model: Player}, {model: Coach}]},
        order: models.sequelize.literal('username DESC')
      }) 

      const users = likes.map(like=> like.user)
      res.json(users)  

    } catch(err) {
      console.log(err)
      res.status(500).json(err)
    }    
  }
}

// Gets a specific video
async function getOneChallengeVideo(videoId, watched) {

    try {
        const video = await ChallengeVideo.findByPk(videoId, {
            include: [ 
                {model: User, required: true, include: {model: Player, required: true}},
                {model: Challenge, required: true}
            ]
        })

        if(video) {
            if(watched==='1') {
                await video.update({view: video.view + 30})
            }
        }
        
        return video 

    } catch(err) {
        throw new Error(err)
    }    
}

// Gets all the challenges videos sent either by all users or by only one
async function getAllChallengesVideos(name, teamsIds, seasonId, ageCategoryId, categoryId, limit, offset, order, type, challengeId, userId, getFullLength) {
    
    try {
        
        let query = ChallengesController.buildQuery(name, teamsIds, seasonId, ageCategoryId, categoryId, limit, offset, order, type, challengeId, userId)[2]

        // This is to get only videos that are complete (associated to a user, a challenge, a score etc.)
        query['enable'] = true

        if(query['where']['team_id'] && query['where']['challenge_id']) {
            const challengeId = query['where']['challenge_id']
            const challenge = await Challenge.findByPk(challengeId)
            const challenges = await Challenge.findAll({where: {name: challenge.name}})
            const challengesIds = challenges.map(challenge=> challenge.id)
            query['where']['challenge_id'] = {$in: [challengesIds]}
        }

        const videos = await ChallengeVideo.findAll(query)
        let data = {list: videos}

        if(getFullLength) {
        /* The request also needs the original number of the videos without taking 
            without taking into account the size display parameters. Can be used for instance
            if we want to display only a few videos of the users but we also want to show the total number of videos he sent
        */
            if(limit) {
                const newQuery = {...query}
                delete newQuery['limit']
                delete newQuery['offset']
                const allVideos = await ChallengeVideo.findAll(newQuery)
                data.number = allVideos.length
            }
        }

        return data

    } catch(err) {
        throw new Error(err)
    }
} 

/* Checks if the user must receive points/footcoins 
due to his participation to the training exercice and make the
necessary updates */
async function updatePlayer(userId, player, video, newData, videoMax, scoreParticipation, challengePoint, challengeFootcoin, bestSkillThreshold) {
  
    const origin = "Challenge"

    let pointsEarned = 0, footcoinsEarned = 0

    try {

        if(videoMax) {
        /* This is not the first time the user participates to this challenge */

            if(scoreParticipation>videoMax.score) {

                /* Th user has done better than before -> we need to update
                the table to indicate that this video is now his best one */
                videoMax.update({is_score_max: false})
                newData['is_score_max'] = true

                /* The user must earn the specific number of points/footcoins that is associated to the level reached.
                However since he already has points for this challenge, we calculate how many points he still
                need */
                pointsEarned = challengePoint - videoMax.point
                footcoinsEarned = challengeFootcoin - videoMax.footcoin

                /* Since scoreMax is defined, this implies that the user
                already has some points thanks to this challenge. 
                The table earning and earning_total will be updated */
                EarningController.updateOrCreate(userId, origin, pointsEarned, footcoinsEarned)
            }  

        } else {
        // The user participates to the challenge for the first time 

            pointsEarned = challengePoint 
            footcoinsEarned = challengeFootcoin
            newData['is_score_max'] = true

            /* scoreMax is not defined but we don't know if the user already 
            has some points thanks to other challenges. The function below 
            will do the check and decide either to create or update */
            EarningController.updateOrCreate(userId, origin, pointsEarned, footcoinsEarned)   
        }

        video.update(newData)

        await player.update({
            total_point: player.total_point + pointsEarned,
            total_footcoin: player.total_footcoin + footcoinsEarned
        })

        // Gets the user's status and best skill
        UserController.getUserStatusAndSkill(userId, player, bestSkillThreshold)

        return [pointsEarned, footcoinsEarned]

    } catch(err) {
        throw new Error(err)
    }
}

/* Creates the main elements that will be used to calculate
to calculate the user's points and footcoins */
async function createMainElements(userId, videoId, challengeId, scoreParticipation) {

  try {

    const [challenge, video, player, bestSkillThreshold] = await Promise.all([
      /* This gets the number of points and footcoins given to a user
      depending on the step reached for a specific challenge */
      Challenge.findByPk(challengeId, {
        include: {model: ChallengeStep}
      }),

      ChallengeVideo.findByPk(videoId),

      Player.findOne({where: {
        user_id: userId
      }}),

      // The threshold that must be reached to receive a best skill attribute
      BestSkillThreshold.max('point')

    ])

    /* Get the user's training video where he got the best score 
    for a specific challenge and a specific team*/
    const videoMax = await ChallengeVideo.findOne({
      where: {
       challenge_id: challengeId,
       user_id: userId,
       team_id: challenge.team_id,
       is_score_max: true          
      }
    })

    return [challenge, videoMax, video, player, bestSkillThreshold]

  } catch(err) {
    throw new Error(err)
  }
}

/* Updates the coach and the club footcoins when a player achieves an 
exercice associated to one or many teams */
async function updateCoachAndClubFootcoins(challengesIds, footcoins) {

  try {

    const challenges = await Challenge.findAll({
      include: {model: Team, include: [
        {model: Coach, include: {model: User}},
        {model: Club, include: {model: User}},
        ]}, where: {
          id: {$in: [challengesIds]}
        }
    })

    const activatedTeams = challenges.reduce((list, challenge)=> 
      challenge.team && challenge.team.registered_by_club && challenge.team.activated ? 
      list.concat(challenge.team) : list, [])

    if(activatedTeams.length) {
      const [coach, club] = [activatedTeams[0].coach, activatedTeams[0].club]
      const finalFootcoins = Math.round(footcoins/2)
      coach.update({total_footcoin: coach.total_footcoin + finalFootcoins})
      EarningController.updateOrCreate(coach.user.id, 'Challenge', 0, finalFootcoins)
      club.update({total_footcoin: club.total_footcoin + finalFootcoins})
      EarningController.updateOrCreate(club.user.id, 'Challenge', 0, finalFootcoins)      
    }

  } catch(err) {
    throw new Error(err)
  }
}