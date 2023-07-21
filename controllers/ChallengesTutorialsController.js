'use strict';
const models = require('../models') 

const ChallengeTutorial = models.challenge_tutorial
const Challenge = models.challenge 

const ChallengesController = require('../controllers/ChallengesController')
const UploadController = require('../controllers/UploadController')

const originFrontURL = `${process.env.FRONT_PROTOCOL}://${process.env.FRONT_DOMAIN}`

module.exports = {

  /* Gets the challenge tutorials depending on the filters 
  selected by the user */
  async getChallengesTutorials(req, res) {
    const name = decodeURIComponent(req.params.name),
      teamsIds = req.params.teamsIds,
      seasonId = parseInt(req.params.seasonId),
      ageCategoryId = parseInt(req.params.ageCategoryId),    
      categoryId = parseInt(req.params.categoryId),
      challengeId = parseInt(req.params.challengeId),
      limit = parseInt(req.params.size),
      offset = limit * parseInt(req.params.page),
      order = req.params.order

    let response = {}

    const [oneTutorial, multipleTutorials, dataQuery] = ChallengesController.buildQuery(name, teamsIds, seasonId, ageCategoryId, categoryId, limit, offset, order, 'ChallengeTutorial', challengeId)

    try {

      if(oneTutorial) {

        const newDataQuery = Object.assign({}, dataQuery)
        newDataQuery['where'] = {
          name: name
        }

        response['tutorial'] = await ChallengeTutorial.findOne(newDataQuery)
      } 

      if(multipleTutorials || req.params.categoryId==='all') {
        delete dataQuery['where']['name']

        if(teamsIds && parseInt(teamsIds[0]) && teamsIds.length>1) {
          delete dataQuery['limit']
          delete dataQuery['offset']
          response['tutorials'] = await ChallengeTutorial.findAll(dataQuery)          
          ChallengesController.getUniquesFromCoach(response, 'tutorials', limit, offset)

        } else {
          response['tutorials'] = await ChallengeTutorial.findAll(dataQuery)
        }        
      }

      res.json(response)

    } catch(err) {
      console.log(err)
      res.status(500).json(err)      
    }
  },

  /* Enables user to propose us a new challenge tutorial */
  async createChallengeTutorial(req, res) {
    const tutorialData = req.body,
      teamsIds = tutorialData.teams_ids

    try {

      if(teamsIds && teamsIds.length) {
        tutorialData['team_id'] = teamsIds[0]
        tutorialData['activated'] = true

        await ChallengesController.createForChallenge(tutorialData, ChallengeTutorial)

        const firstTutorial = await ChallengeTutorial.findByPk(tutorialData.id)
        console.log(firstTutorial)
        tutorialData['thumbnail_path'] = firstTutorial['thumbnail_path']
        
        const teamsIdsLength = teamsIds.length
        for(let i=1;i<teamsIdsLength;i++) {
          tutorialData['id'] = tutorialData.id + 1
          tutorialData['team_id'] = teamsIds[i]
          await ChallengeTutorial.create(tutorialData)
          await ChallengesController.createForChallenge(tutorialData, ChallengeTutorial)
        }
        
      } else {
        await ChallengesController.createForChallenge(tutorialData, ChallengeTutorial)
      }

      res.json(true)

    } catch(err) {
      console.log(err)
      res.status(500).json(err) 
    } 

    UploadController.generateThumbnail("challenges/tutorials", tutorialData.bf_path, tutorialData.thumbnail_path)

    if(tutorialData['activated']) {
      this.acceptChallengeTutorial(tutorialData.id, tutorialData.challenge_id)
    } else {
      ChallengesController.sendEmailNotification(tutorialData, 'tutorial')    
    }
  },


  // Makes the challenge tutorial available and sends a notification to users
  acceptChallengeTutorial(tutorialId, challengeId) {
    let message = {
      body: "Nouveau tutoriel pour ce challenge !",
        icon: `${originFrontURL}/images/logos/bestfootball_logo.png`,
      tag: "new-tutorial",
      "content-available": 1 
    }

    ChallengesController.acceptForChallenge(ChallengeTutorial, tutorialId, message)    

    Challenge.update({has_real_tutorial: true}, {
      where: {id: challengeId}
    })
  }
}