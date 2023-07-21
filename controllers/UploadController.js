'use strict'

const models = require('../models')
const User = models.user
const Player = models.player
const Coach = models.coach
const Club = models.club
const Team = models.team
const Challenge = models.challenge
const ChallengeTutorial = models.challenge_tutorial
const ChallengeVideo = models.challenge_video
const Duel = models.duel


module.exports = {
 
    // Enables the user to upload a file
    async uploadFile(req, res, type) {

        const newData = { 
            bf_path: req.file.filename, 
            avatar: req.file.filename
        }

        switch(type) {

            case 'Avatar':
                uploadUserAvatar(res, newData, req.body.userId)
                break

            case 'TeamAvatar':
                uploadTeamLogo(res, newData, req.body.unique_name)
                break

            case 'Duel':
                uploadDuelVideo(res, req.body.userId, req.body.duelId, req.file.filename)
                break

            default:
                let model
                if(type==='Challenge') {
                    model = Challenge
                } else if(type==='ChallengeTutorial') {
                    model = ChallengeTutorial
                } else {
                    model = ChallengeVideo
                }

                uploadForChallenge(res, model, newData)
        }
    },


  // Generates the uploaded video thumbnail 
  generateThumbnail(videoType, inputPath, outputPath) {
    const exec = require('child_process').exec;
    const command = `${process.env.API_PATH}/scripts/thumbnails.sh 1 1x1 500 ${process.env.FRONT_PATH}/upload/videos/${videoType}/${inputPath} ${process.env.FRONT_PATH}/upload/images/${videoType}/${outputPath}`
    const child = exec(command, function (error, stdout, stderr) {
        if (error !== null) {
            console.log('exec error: ' + error);
        }
    })
  },


  // Deletes a video from the database
  async deleteVideo(req, res, model) {
    const whereData = {
      id: req.params.identification
    }
    try {
      await model.destroy({where: whereData})
      res.json(true)
    } catch(err) {
      res.status(500).json(err)
    }
  }    
}


// Enables the user to upload his video for a challenge partipation
async function uploadForChallenge(res, model, newData) {
  try {
    const video = await model.create(newData)
    res.json(video)
  } catch(err) {
    console.log(err)
    res.status(500).json(err)    
  }
}

// Enables the user to upload his video for a duel participation
async function uploadDuelVideo(res, userId, duelId, filename) {
    let newData = {}

    const duel = await Duel.findByPk(duelId)
    
    const userAskingId = duel.user_asking_id,
        userAskedId = duel.user_asked_id

    /* We check first if it's a video from the player 
    who sent the duel request or from the one who received it 
    this will update the temporary path in case the user does not finish his upload for any reason (e.g. cancel the upload)
    */
    userId === userAskingId ? newData.user_asking_duel_temporary_path = filename : newData.user_asked_duel_temporary_path = filename

    await Duel.update(newData, {
        where: {id: duelId}
    }).catch(err => {
        console.log(err)
        return res.status(500).json(err)       
    })
        
    res.json(true)
}

// Enables the user to upload his avatar
async function uploadUserAvatar(res, newData, userId) {

    const whereData = { user_id: userId }
    
    try {

        var user = await User.findByPk(userId, {
            include: [
                {model: Player},
                {model: Coach},
                {model: Club}
            ]
        })

    } catch (err) {
        res.status(500).json(err)
        throw new Error(err)
    }

        let model
        
        if(user.player) {
            model = Player
        } else if(user.coach) {
            model = Coach
        } else {
            model = Club
        }

    await model.update(newData, { where: whereData }) 
    res.json(newData.avatar)
}

// Enables the user to upload a team logo
async function uploadTeamLogo(res, newData, teamUniqueName) {

    const whereData = { unique_name: teamUniqueName }

    try {

        await Team.update(newData, { where: whereData })
        res.json(newData.avatar)

    } catch (err) {
        console.log(err)
        res.status(500).json(err)
    }
}