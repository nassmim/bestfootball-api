'use strict'

const models = require('../models')

const ChallengeVideo = models.challenge_video
const DuelSummary =  models.duel_summary
const Player = models.player
const User = models.user
const Earning = models.earning
const Origin = models.origin
const Address = models.address
const Country = models.country
const City = models.city

const MainController = require('../controllers/MainController')


module.exports = {

		/* Get the ranking based on :
		- modelRanked-> model to rank 
		- modelUsed-> model used to calculate the points
		- filterToUse-> filters for the modelRanked
		- whereUsed-> where clause for the modelUsed
		- includeUsed-> include clause for the modelUsed
		- sumQueryUsed-> formula used to rank the modelRanked
		- and the rest of the variables determines how to organize the result */
	async getRanking(req, res) {

		const [modelRanked, queryData, filterUser] = RankingController.buildQuery(req)

		const usersRanking = await modelRanked.findAll(queryData);

		let ranking = usersRanking

		if(Number.isInteger(parseInt(filterUser['userId'].id))) {
		  // A specific user has been defined, we need to find his ranking
		  ranking = await RankingController.getUserRanking(usersRanking, filterUser['userId'].id)
		}

		res.json(ranking)
	},


	// Get the ranking of a specific user
	async getUserRanking(usersRanking, userId) {
    const ranking = usersRanking;
    let userRank, user
    for (let i = 0; i < ranking.length; i++) {
      if (ranking[i].id == userId) {
      	userRank = i + 1
      	user = ranking[i]
        break;
      }
    }
    return {user: user, rank: userRank}
	}
}


/* Builds the necessary query data in order to get the ranking 
depending on the filters the user has selected */
function buildQuery(req) {
	let orderUsed = models.sequelize.literal('totalPoints DESC'),
	  groupUsed = ['user.id']

	const filterUser = {
	  userId: {id:req.params.userId},
	  gender: {gender:req.params.gender},
	  country: {id:req.params.country}
	}

	const filterChallengeIds = {
	  challenge_category_id: req.params.challengeCategoryId,
	  challenge_id: req.params.challengeId
	}

	const filterToUse = MainController.getFiltersValues(filterUser, filterChallengeIds)
	const modelRanked = User
	const originName = MainController.capitalizeFirstLetter(req.params.section)
	// Defines which model must be used and how to work with it
	const [modelUsed, sumQueryUsed, whereUsed, includeUsed] = defineModel(originName, filterToUse)
	const limit = parseInt(req.params.size)
	const offset = limit * parseInt(req.params.page)
	
	const includeQuery = {
    attributes: [], 
    model: modelUsed,
    duplicating: false,
    required: false,
    where: whereUsed,
    include: includeUsed
  }

  // Gets the final data that will be used to get the ranking
  const queryData = finaliseQueryData(includeQuery, filterToUse, limit, offset) 

  return [modelRanked, queryData, filterUser]
}

// Defines which model must be taken and which calculations 
function defineModel(originName, filterToUse) {
	let modelUsed, sumQueryUsed, whereUsed,
		includeUsed = []

	if(Object.keys(filterToUse['challengeIds']).length>0) {

	  whereUsed = filterToUse['challengeIds']

	  if(originName==='Challenge'){
	    modelUsed = ChallengeVideo
	    sumQueryUsed = [[models.sequelize.fn('sum', models.sequelize.col('challenge_videos.point')), 'totalPoints']]
	    whereUsed['is_score_max'] = true

	  } else {
	    modelUsed = DuelSummary
	    sumQueryUsed = [[models.sequelize.fn('sum', models.sequelize.col('duel_summaries.point')), 'totalPoints']]
	  }   

	} else {
	  modelUsed = Earning
	  sumQueryUsed = [[models.sequelize.fn('sum', models.sequelize.col('earnings.point')), 'totalPoints']]
	  includeUsed = [{model:Origin, where:{name:originName}}]
	}	

	return [modelUsed, sumQueryUsed, whereUsed, includeUsed]
}

// Establishes the final query data necessary to get the ranking
function finaliseQueryData(includeQuery, filterToUse, limit, offset) {
  let countryRequired = false,
  	includeFinal = []

	if(filterToUse['user']['country']) {
		countryRequired = true
	}	  	

	if(!filterToUse['user']['userId']) {
		// there is no specific user defined which means we are looking for a global ranking
		includeFinal = [includeQuery, {model:Address, required:countryRequired, include:[{model:City, required:countryRequired, include:[{model:Country, required:countryRequired, where:filterToUse['user']['country']}]}]}, {model: Player, required:true, where:filterToUse['user']['gender']}]
	} else {
		// we just need the ranking of a specific user, not taking care about his gender, country, etc.
		includeFinal = [includeQuery]
	}	  

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