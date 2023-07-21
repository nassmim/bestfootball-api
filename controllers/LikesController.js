'use strict'

const models = require('../models')

const LikeGiven = models.like_given
const ChallengeVideo = models.challenge_video
// const LikeResult = models.like_result
// const Player = models.player

// const EarningController = require('../controllers/EarningController')
 

module.exports = {

  /* Gives a new like to the video */
  async like(req, res) {

    try{
      const [like, challengeVideo] = await createMainElements(req.body.user_id, req.body.challenge_video_id)
      const result = await updateVIdeo(req.body, challengeVideo, like)
      res.json({given: result, likes: challengeVideo.like})         
    } catch(err) {
      console.log(err)
      res.status(500).json(err)
    }    
  }
}

// Creates the main elements for the like function
async function createMainElements(userId, videoId) {

  try {

    const [like, challengeVideo] = await Promise.all([
        LikeGiven.findOne({where: {challenge_video_id: videoId,  user_id: userId}}),
        ChallengeVideo.findOne({where: {id: videoId}})
        // LikeResult.max('point'),
        // LikeResult.max('footcoin')
    ]) 
    
    return [like, challengeVideo]

  } catch(err) {
    console.log(err)
    return null
  }
}

// Updates the video number of likes
async function updateVIdeo(data, video, like) {
  let result

  try {

    if(like){
    // The user has already liked the video, so he now unlikes it
      like.destroy()
      video.update({like: video.like - 1})
      /* Since like is defined, this implies that the user already 
      had some points thanks to this like. We need to decrease his points */
      // pointsEarned = - likePoint
      // footcoinsEarned = - likeFootcoin
      // It updates the user's earning
      // EarningController.updateOrCreate(userId, originName, pointsEarned, footcoinsEarned)
      result = false

    } else {
      // pointsEarned = likePoint
      // footcoinsEarned = likeFootcoin
      LikeGiven.create(data) 
      video.update({like: video.like + 1})
      // It updates or creates the user's earning
      // EarningController.updateOrCreate(userId, originName, pointsEarned, footcoinsEarned)            
      result = true
    }

    /* We update the user's total points & footcoins */
/*    const player = await Player.findOne({
      where: {user_id: userId}
    })

    await player.update({
      total_point: player.total_point + pointsEarned,
      total_footcoin: player.total_footcoin + footcoinsEarned
    })*/  

    return result

  } catch(err) {
    throw new Error(err)    
  }
}