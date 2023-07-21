'use strict'

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env]
const rolesNames = config.roles

const models = require('../models') 
const Player = models.player
const Coach = models.coach
const User = models.user
const TeamUser = models.team_user
const Club = models.club
const PlayerCategory = models.player_category
const Position = models.player_position
const PreferredFoot = models.preferred_foot
const UserStatus = models.user_status
const ChallengeCategory = models.challenge_category
const Season = models.season
const Country = models.country


module.exports = {

    // Gets all the users 
    async getUsers(res) {

        try {
            const users = await User.findAll({
                include: [
                    {model: TeamUser},
                    {model: Player},
                    {model: Coach},
                    {model: Club}
                ],
                order: ['username']
            })

            res.json(users) 

        } catch(err) {
            console.log(err)
            res.status(500).json(err)
        }
    },

    // Get all clubs fromt FFF and all clubs registered as users
    async getClubs(res) {

        try {

            const clubs = await Club.findAll({
                where: {
                    name: {
                        $ne: null
                    }
                },
                order: ['name']
            })

            res.json(clubs)

        } catch (err) {
            console.log(err)
            res.status(500).json(err)
        }
    },

    async getCountries(res) {
        try {
            const countries = await Country.findAll()
            res.json(countries);
        } catch (err) {
            console.log(err)
            res.status(500).json(err)
        }        
    },

    // Gets some characteristics for players
    async getPlayerCharacteristics(res) {

        try {
            var [categories, positions, foots, status, challengesCategories] = await Promise.all([
                PlayerCategory.findAll(),
                Position.findAll(),
                PreferredFoot.findAll(),
                UserStatus.findAll(),
                ChallengeCategory.findAll()
            ])

        } catch (err) {
            return res.status(500).send(err);
        }

        const response = {
            'categories': categories,
            'positions': positions,
            'foots': foots,
            'status': status,
            'challengesCategories': challengesCategories
        }

        res.json(response)        
    }, 
    
    async getSeasons(res) {
        const seasons = await Season.findAll()
            .catch((err) => {return res.status(500).send(err)})
        res.json(seasons)
    }
}
