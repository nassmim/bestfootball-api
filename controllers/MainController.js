'use strict'
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env]
const rolesNames = config.roles

const models = require('../models')
const User = models.user
const Player = models.player
const Origin = models.origin
const Club = models.club
const Coach = models.coach
const TeamUser = models.team_user
const PlayerCategory = models.player_category
const Season = models.season
const Position = models.player_position

module.exports = {

    // Selects the model to use depending on the user's role
    selectUserModel(roles) {
        let model

        if (roles.includes(rolesNames.coach)) {
            model = Coach
        } else if (roles.includes(rolesNames.club)) {
            model = Club
        } else {
            model = Player
        } 

        return model
    },
  
  // Builds the query depending on type of data
  buildIncludeQuery(type) {
    let includeQuery

    switch(type) { 
      case 'team':
          includeQuery = [
            {model: TeamUser, include: [
              {model: User, include: {model: Player}},
              {model: Position}
              ]},
            {model: Club, include: {model: User}},
            {model: Coach, include: {model: User}},
            {model: PlayerCategory},
            {model: Season} 
          ]          
        break
    }

    return includeQuery 
  },

  caseSensitive(column, field) {
    return models.sequelize.where(
            models.sequelize.literal(`BINARY ${column} in (`),
            `'${field}'`,
            models.sequelize.literal(')'))
  },

  // Defines which controller and function to use 
  async getControllerFunction(req, res, next, functionToCall) {
    try {
      const response = await functionToCall(req)
      res.json(response)
    } catch(err) {
      res.status(500).json(err);
    }
  },


  /* Gets the right id from the sql table for the origin of the 
  points and footcoins */
  async getOriginId(originName) {
    try {
      const origin = await Origin.findOne({
      where: {
        name: originName
      }
    })
      return origin.id    
        
    } catch(err) {
      console.log(err)
    }
  },


  // This identifies and defines the value of the filters
  getTwostepFiltersValues(filters) {
    let filtersToUse = {}

    for (let filter in filters) {
      filtersToUse[filter] = {}
      for (let subFilter in filters[filter]) {
        if(filters[filter][subFilter] && filters[filter][subFilter]!=="all") {
          filtersToUse[filter][subFilter] = filters[filter][subFilter]
        } 
      }
    }

    return filtersToUse
  },


 // This identifies and defines the value of the filters
  getOnestepFiltersValues(filters) {
    let filtersToUse = {}

    for (let filter in filters) {
      if(filters[filter] && filters[filter]!=="all") {
        filtersToUse[filter] = filters[filter]
      } 
    }   
    return filtersToUse
  },


  capitalizeFirstLetter(string) {
    if(string) {
      return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
    }
  }  
}