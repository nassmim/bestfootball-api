'use strict'

const models = require('../models')
const Earning = models.earning

const MainController = require('../controllers/MainController')


module.exports = {
  
  // Enables the user to upload a file
  async updateOrCreate(userId, originName, points, footcoins) {
		try {
			const originId = await MainController.getOriginId(originName)
			const earning = await findUserEarning(userId, originId)

	    if(earning) {
	      updateUserEarning(earning, points, footcoins) 
	    } else {
	      createUserEarning(userId, originId, points, footcoins)
	    }  
		} catch(err) {
			console.log(err)
		}
  }   
}


/* Updates the user's earning */
async function updateUserEarning(earning, points, footcoins) {
  await earning.update({
    point: earning.point + points,
    footcoin: earning.footcoin + footcoins
  })
}  

/* Creates a new earning for the user and this origin */ 
function createUserEarning(userId, originId, points, footcoins) {
	Earning.create({
    user_id: userId,
    origin_id: originId,
    point: points,
    footcoin: footcoins
  })
}

/* Checks if the user already has earning from this origin */
async function findUserEarning(userId, originId) {
  try {
  	const earning = await Earning.findOne({where: {user_id: userId, origin_id: originId}})
  	if (earning) {
  		return earning
  	}  	
  } catch(err) {
  	console.log(err)
  }
}