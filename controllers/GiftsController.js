'use strict'

const models = require('../models')

const Gift = models.gift 
const Partner = models.partner
const GiftBought = models.gift_bought

const MainController = require('../controllers/MainController')
const NotificationsController = require('../controllers/NotificationsController')

module.exports = {

  // Enables the user to buy a gift
  async buyGift(req, res) {

  GiftBought.create(req.body)

  .then(result => {

    const model = MainController.selectUserModel(req.body.roles)

    model.findOne({where: {user_id: req.body.user_id}})
    .then(user => {
      //Updates the user footcoins
      let total_footcoin_new = user.total_footcoin
      if(total_footcoin_new>req.body.gift_price){
          total_footcoin_new = total_footcoin_new - req.body.gift_price
      } else {
        return res.json({notBought: true})
      }

      const newData = {
          total_footcoin: total_footcoin_new
      };

      user.update(newData)
        .then(user => {
            return res.json({user: user})
        })
        .catch(err => res.status(500).json(err));

      })
      .catch(err => res.status(500).json(err));        
    })
    .catch(err => res.status(500).json(err))

    sendEmailNotificationToUs(req.body.user_id, req.body.gift_id)
  },


  // Gets the list of the gifts 
  getGifts(req, res) {
    const limit = parseInt(req.params.size),
      offset = limit * parseInt(req.params.page),
      userId = parseInt(req.params.userId),
      forClubs = req.params.forClubs==='true' ? true : false

    let model, whereUsed = {},
      dataRequired = {
        order: [['created_at', 'DESC']]
      }
      
    if(userId) {
      model = GiftBought
      dataRequired['include'] = {model: Gift}
      whereUsed['user_id'] = userId
    } else {
      model = Gift
      dataRequired['include'] = {model: Partner}
      whereUsed = {
        enabled: true,
        for_clubs: forClubs
      }
    }    

    dataRequired['where'] = whereUsed

    if(limit) {
      dataRequired['limit'] = limit
      if(offset) {
        dataRequired['offset'] = offset
      }
    }  

    model.findAll(dataRequired)
    .then(gifts=> res.json(gifts))
    .catch(err=> res.status(500).json(err))    
  },


    // Get a specific gift information
    getOneGift(req, res) {
        Gift.findOne({
            include : [
                {model: Partner},
            ],
            where: {
                $or: [
                    { french_name: decodeURIComponent(req.params.name)},
                    { english_name: decodeURIComponent(req.params.name)},
                ]
            }
        })
        .then(gift=> res.json(gift))
        .catch(err=> res.status(500).json(err))    
    }
}

// Creates the filters that will be used to select the users
function sendEmailNotificationToUs(userId, giftId) {
          
  const text = `New gift has been bought: 
  
  gift_id: ${giftId},
  user_id: ${userId}`

  const mailOpts = {
    from: 'BestFootball notification' + '&gt;',
    to: process.env.GMAIL_USER,
    subject: `New gift bought`,
    text: text
  };

  NotificationsController.emailNotification(mailOpts)
}