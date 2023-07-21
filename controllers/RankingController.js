'use strict'

const models = require('../models')

const ChallengeVideo = models.challenge_video
const DuelSummary =  models.duel_summary
const User = models.user
const Team = models.team
const Player = models.player
const Address = models.address
const Country = models.country
const City = models.city
const UserStatus = models.user_status

const MainController = require('../controllers/MainController')


module.exports = {

		/* Enables the user to see the ranking depending on the 
		filters he has selected */
	async getRanking(req, res) {
		let orderUsed = models.sequelize.literal('totalPoints DESC'),
		  groupUsed = ['user.id']
		
        const teamId = req.params.teamsIds,
            seasonId = req.params.seasonId,
            ageCategoryId = req.params.ageCategoryId

        const modelRanked = User	

        const filtersUser = {
            userId: {id:req.params.userId},
            gender: {gender:req.params.gender},
            country: {id:req.params.country}
        }

		const filtersChallenge = {
            challenge_category_id: req.params.challengesCategoryId,
            challenge_id: req.params.challengeId,
            team_id: teamId
		}		

		const limit = parseInt(req.params.size)
        const offset = limit * parseInt(req.params.page)
        const originName = MainController.capitalizeFirstLetter(req.params.sectionName)
        const filtersUserToUse = MainController.getTwostepFiltersValues(filtersUser)
        const filtersChallengeToUse = MainController.getOnestepFiltersValues(filtersChallenge)

		if(!filtersChallengeToUse.team_id) {
			filtersChallengeToUse.team_id = null
		}	
		  
		// Defines which model must be used and how to work with it
        const [modelUsed, sumQueryUsed, whereUsed, includeUsed] = defineModel(originName, filtersChallengeToUse, seasonId, ageCategoryId)
        const includeFinal = this.buildRankingIncludeQuery(filtersUserToUse, modelUsed, whereUsed, includeUsed)
		const queryData = this.buildRankingQuery(sumQueryUsed, includeFinal, groupUsed, orderUsed, limit, offset)

		try { 
			const rankings = await this.getUsersRanking(modelRanked, queryData, filtersUserToUse['userId'].id)

			res.json(rankings)

		} catch(err) {
			console.log(err)
			res.status(500).json(err)
		}
	},


	/* Once eveything has been set up, this retrieves the data 
	from the database and sends the response to the request */
	async getUsersRanking(modelRanked, queryData, userId) {

		try {
			const usersRanking = await modelRanked.findAll(queryData)
			
			let individualRanking = 0
			if(parseInt(userId)) {
				delete queryData.limit
				delete queryData.offset
				const allUsersRanking = await modelRanked.findAll(queryData)
			  // A specific user has been defined, we need to find his ranking
			  individualRanking = await getUserRanking(allUsersRanking, userId)
			}

			return {usersRanking: usersRanking, individualRanking: individualRanking}
			
		} catch(err){
			throw new Error(err)
		}
	},

  /* Builds the include query that which table to use to 
  rank people and which criteria they must meet */
  buildRankingIncludeQuery(filters, modelUsed, whereUsed, includeUsed) {
    let countryRequired = false,
      includeFinal = []

    const includeQuery = {
      attributes: [], 
      model: modelUsed,
      duplicating: false,
      required: true,
      where: whereUsed,
      include: includeUsed
    }

    if(filters['country'] && filters['country'].id) {
      countryRequired = true
    }     

      includeFinal = [includeQuery, { model: Address, required: countryRequired, include: [{ model: City, required: countryRequired, include: [{ model: Country, required: countryRequired, where: filters['country'] }] }] }, { model: Player, required: true, where: filters['gender'], include: [{ model: UserStatus, as: 'userStatus' }]}]
    
    return includeFinal
  },


  /* Finishes to build the query data and 
  sets how will be displayed the ranking */
  buildRankingQuery(sumQueryUsed, includeFinal, groupUsed, orderUsed, limit, offset) {

    let queryData = {
      attributes: {
        include: sumQueryUsed
      },
      include: includeFinal,
      group: groupUsed,
      order: orderUsed,
    }

    if(limit) {
      queryData['limit'] = limit
      if(offset) {
        queryData['offset'] = offset
      }
    }

    return queryData
  }	
}


// Gets the ranking of a specific user
function getUserRanking(usersRanking, userId) {
  const ranking = usersRanking;
  let userRank, user
  for (let i = 0; i < ranking.length; i++) {
    if (ranking[i].id == userId) {
    	userRank = i + 1
    	user = ranking[i]
      break;
    }
  }
  return {user: user, userRank: userRank}
}

/* Defines which model must be taken and which calculations
will be made to obtain the ranking */
function defineModel(originName, filtersChallengeToUse, seasonId, ageCategoryId) {
    
    let modelUsed, sumQueryUsed,
		whereUsed = {},
        includeUsed = []

    whereUsed = filtersChallengeToUse

    if(originName==='Challenge') {
        modelUsed = ChallengeVideo
        sumQueryUsed = [[models.sequelize.fn('sum', models.sequelize.col('challenge_videos.point')), 'totalPoints']]
        whereUsed['is_score_max'] = true

        if(whereUsed.team_id) {
            let whereTeam = {}

            if(parseInt(seasonId) || parseInt(ageCategoryId)) {
                const filters = {
                    season_id: seasonId,
                    player_category_id: ageCategoryId,
                }      
                whereTeam = MainController.getOnestepFiltersValues(filters)	    	
            }

            whereTeam['activated'] = true
            includeUsed = [{model: Team, where: whereTeam}]
    }

    } else {
            delete filtersChallengeToUse.team_id
            modelUsed = DuelSummary
            sumQueryUsed = [[models.sequelize.fn('sum', models.sequelize.col('duel_summaries.point')), 'totalPoints']]
    }   

	return [modelUsed, sumQueryUsed, whereUsed, includeUsed]
}