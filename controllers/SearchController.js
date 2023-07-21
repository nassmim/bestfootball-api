'use strict'

const models  = require('../models');

const Player = models.player
const User = models.user
const Address = models.address
const City = models.city 
const Country = models.country
const Club = models.club
const ChallengeCategory = models.challenge_category
const UserStatus = models.user_status

const MainController = require('../controllers/MainController')

module.exports = {

  /* Enables the user to make an avanced research of users 
  depending on the filters he selected */
  async advancedResearch(req, res) {

    try {
      const params = req.params
      const limit = parseInt(req.params.size)
      const offset = limit * parseInt(req.params.page)
      const [filterToUse, required] = getFilters(params)
      const includeToUse = getIncludeQuery(filterToUse, required) 

      const users = await User.findAll({
        include: includeToUse,
        where: {
          activated: true
        },
        limit: limit,
        offset: offset,
        order: ['username']
      })

      res.json({users: users})

    } catch(err) {
      console.log(err)
      res.status(500).json(err)
    }
  }
}


// Creates the filters that will be used to select the users
function getFilters(params) {
  let required = {},
    filtersUser = {
    player : {
      gender: params['gender'],
      category_id: params['categoryId'],
      position_id: params['positionId'],
      preferred_foot_id: params['preferredFootId']
    },
    status: {
      id: params['statusId']          
    },
    bestSkill : {
      id: params['bestSkillId']   
    },
    city: {
      name: params['cityName']
    },
    country: {
      name: params['countryName']
    },
    club: {
      name: params['clubName']
    }
  }

  const filterToUse = MainController.getTwostepFiltersValues(filtersUser)

  for(let filter in filterToUse) {
    if(Object.keys(filterToUse[filter]).length) {
      required[filter] = true
    } else {
      required[filter] = false
    }
  }

  required['player'] = true
  required['address'] = false
  if(required['city'] || required['country']) {
    required['address'] = true
  } 

  return [filterToUse, required] 
}

// Establishes the include query used to get the users
function getIncludeQuery(filterToUse, required) {
  const includeToUse = [
    {model: Address, required: required['address'], 
      include: {model: City, required: required['city'],
        where: filterToUse['city'],
        include: {model: Country, required: required['country'],
          where: filterToUse['country']}
    }},  
    {model:Player, required: required['player'],
      where: filterToUse['player'], 
      include:[
      {model: UserStatus, as: 'userStatus', required: required['status'], where: filterToUse['status']},
      {model: ChallengeCategory, as: 'bestSkill', required: required['bestSkill'], where: filterToUse['bestSkill']},
      {model: Club, required: required['club'], where: filterToUse['club']}
    ]},
  ]

  return includeToUse 
}