'use strict';
const models = require('../models') 

const User = models.user
const Player = models.player
const CoachExercice = models.coach_exercice
const CoachExerciceModule = models.coach_exercice_module
const CoachExercicePlayerScore = models.coach_exercice_player_score

const ChallengesController = require('../controllers/ChallengesController')

const originFrontURL = `${process.env.FRONT_PROTOCOL}://${process.env.FRONT_DOMAIN}`

module.exports = {

  /* Gets the coach's exercices depending on the filters 
  selected by the user */
    async getExercises(req, res) {

        const name = decodeURIComponent(req.params.name),
            teamsIds = req.params.teamsIds,
            seasonId = parseInt(req.params.seasonId),
            ageCategoryId = parseInt(req.params.ageCategoryId),    
            moduleId = parseInt(req.params.moduleId),
            limit = parseInt(req.params.size),
            offset = limit * parseInt(req.params.page),
            order = req.params.order

        let response = {}

        const [oneExercice, multipleExercices, dataQuery] = ChallengesController.buildQuery(name, teamsIds, seasonId, ageCategoryId, moduleId, limit, offset, order, 'CoachExercice')

        try {

            if(oneExercice) {

                const newDataQuery = Object.assign({}, dataQuery)
                    newDataQuery['where'] = {
                    name: name
                }

                response['exercise'] = await CoachExercice.findOne(newDataQuery)
            } 

            if(multipleExercices || req.params.moduleId==='all') {
                delete dataQuery['where']['name']

                if(teamsIds && parseInt(teamsIds[0]) && teamsIds.length>1) {

                    delete dataQuery['limit']
                    delete dataQuery['offset']
                    response['exercises'] = await CoachExercice.findAll(dataQuery)
                    ChallengesController.getUniquesFromCoach(response, 'exercises', limit, offset)

                } else {
                    response['exercises'] = await CoachExercice.findAll(dataQuery)
                }        
            }

            res.json(response)

        } catch(err) {
            console.log(err)
            res.status(500).json(err)      
        }
    },


    // Enables the coah to update his player score on a specific exercice
    async updateExercisePlayerScore(req, res) {
        const exerciceId = req.body.coach_exercice_id,
            userId = req.body.user_id

        let playerAttempts = 1,
            playerSuccesses = req.body.success ? 1 : 0

        try {

            const exerciceScore = await CoachExercicePlayerScore.findOrCreate({
                where: {
                    coach_exercice_id: exerciceId,
                    user_id: userId
                }
            })

            if(!exerciceScore[1]) {
                playerAttempts += exerciceScore[0].player_attempt 
                playerSuccesses += exerciceScore[0].player_success
            } 

            const rateSuccesses = Math.round(playerSuccesses * 100 / playerAttempts)

            await exerciceScore[0].update({
                player_attempt: playerAttempts,
                player_success: playerSuccesses,
                rate_success: rateSuccesses
            })
            console.log("************************************")
            console.log(rateSuccesses)
            res.json({player_attempt: playerAttempts, player_success: playerSuccesses,
                rate_success: rateSuccesses})

        } catch(err) {
            console.log(err)
            res.status(500).json(err)      
        }
    },

  // Gets the players scores and overall progression on a specific exercice
    async getExerciseStats(req, res) {
        const exerciceId = req.params.exerciceId,
            userId = parseInt(req.params.userId)

        try {

            const exercice = await CoachExercice.findByPk(exerciceId)
            const oldExercices = await CoachExercice.findAll({
                where: {
                    coach_exercice_module_id: exercice.coach_exercice_module_id,
                    team_id: exercice.team_id
                },
                order: [['created_at', 'ASC']]
            })

            if(userId) {

                const currentScore = await CoachExercicePlayerScore.findOne({
                    include: [
                        {model: User, include: {model: Player}},
                        {model: CoachExercice}
                    ],
                    where: {coach_exercice_id: exerciceId, user_id: userId},
                    attributes: ['player_attempt', 'player_success', 'rate_success', 'user_id'],
                })

                const oldScore = await CoachExercicePlayerScore.findOne({
                    where: {coach_exercice_id: oldExercices[0].id, user_id: userId},
                    attributes: ['player_attempt', 'player_success', 'rate_success', 'user_id'],
                })      

                res.json({userCurrentScore: currentScore, userOldScore: oldScore})

            } else {
                const currentScores = await CoachExercicePlayerScore.findAll({
                    include: {model: User, include: {model: Player}},
                    where: {coach_exercice_id: exerciceId},
                    attributes: ['player_attempt', 'player_success', 'rate_success', 'user_id'],
                    group: ['user_id']
                })

                const oldScores = await CoachExercicePlayerScore.findAll({
                    where: {coach_exercice_id: oldExercices[0].id},
                    attributes: ['player_attempt', 'player_success', 'rate_success', 'user_id'],
                    group: ['user_id']
                })      

                res.json({currentScores: currentScores, oldScores: oldScores})
            }

        } catch(err) {
            console.log(err)
            res.status(500).json(err)      
        }
    },

    /* Gets the exercises modules that match the user request  */
    async getModules(req, res) {

        const userId = req.params.userId,
            exerciseId = parseInt(req.params.exerciseId),
            teamId = parseInt(req.params.teamId)

        

        let response

        try {

            if (exerciseId) {

                response = await CoachExerciceModule.findOne({
                    include: [
                        { model: CoachExercice, where: { id: exerciseId } }
                    ],
                })

            } else {
                
                const allModules = await CoachExerciceModule.findAll({
                    include: [ { model: CoachExercice } ],
                })

                response = allModules

                let teamsModules

                if(teamId) {
                    teamsModules = allModules.filter(module => module.coach_exercice.team_id === teamId)
                } else if(userId) {
                    teamsModules = allModules.filter(module => module.user_id === userId)
                } 
              
                if (teamsModules.length) {
                    response = allModules.concat(teamsModules).sort((a, b) => {
                        return a.french_ame.localeCompare(b.french_ame)
                    })
                }
            }

            res.json(response)

        } catch (err) {
            console.log(err)
            res.status(500).json(err)
        }
    },

  /* Enables user to propose a new exercice */
    async createExercice(req, res) {

        const dataExercice = req.body,
            teamsIds = dataExercice.teams_ids,
            exerciceModuleId = parseInt(dataExercice.coach_exercice_module_id)

        let exerciceModule = {}

        try {

            dataExercice.coach_exercice_module_id = exerciceModuleId

            if(!exerciceModuleId) {

                exerciceModule = await CoachExerciceModule.findOrCreate({
                    where: {
                        $or: [
                            { english_name: dataExercice.module_name },
                            { french_name: dataExercice.module_name },
                        ]
                    },
                    defaults: {
                        english_name: dataExercice.module_name,
                        french_name: dataExercice.module_name                        
                    }
                })
                
                dataExercice.coach_exercice_module_id = exerciceModule[0].id
            }

            const teamsIdsLength = teamsIds.length

            // for(let i=0;i<teamsIdsLength;i++) {
            //     dataExercice['team_id'] = teamsIds[i]
            //     let exercise = await CoachExercice.create(dataExercice)
            //     exercise.update({ name: exercise.name + '-' + exercise.id})
            // }

            dataExercice['team_id'] = teamsIds[0]
            let exercise = await CoachExercice.create(dataExercice)
            await exercise.update({ name: exercise.name + '-' + exercise.id })

            const data = {
                name: exercise.name,
                teamsIds: dataExercice['team_id'],
                seasonId: 'all',
                ageCategoryId: "all",
                moduleId: dataExercice.coach_exercice_module_id,
                size: 'all',
                page: 'all',
                order: "name"
            };

            const [oneExercice, multipleExercices, dataQuery] = ChallengesController.buildQuery(data.name, teamsIds, data.seasonId, data.ageCategoryId, data.moduleId, data.limit, data.offset, data.order, 'CoachExercice')

            dataQuery['where'] = { name: data.name }

            exercise = await CoachExercice.findOne(dataQuery)

            res.json(exercise)

        } catch(err) {
            console.log(err)
            res.status(500).json(err)
        } 

        ChallengesController.sendEmailNotification(dataExercice, 'tutorial')    
  },


  // Makes the challenge tutorial available and sends a notification to users
  acceptCoachExercice(req, res) {
    let message = {
      body: "Nouveau tutoriel pour ce challenge !",
        icon: `${originFrontURL}/images/logos/bestfootball_logo.png`,
      tag: "new-tutorial",
      "content-available": 1
    }

    ChallengesController.acceptForChallenge(CoachExercice, req.body.id, message)    

    Challenge.update({has_real_tutorial: true}, {
      where: {id: req.body.challenge_id}
    })
  }
}