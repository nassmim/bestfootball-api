'use strict'

const NotificationsController = require('../controllers/NotificationsController')

module.exports = {

  async contactUs(req, res) {
    let mailOpts
    let text = `${req.body.name} (${req.body.email}) wrote you: 
    
    ${req.body.message}`

    if(req.body.userId) {
      text = `${req.body.name} (${req.body.userId}) (${req.body.email}) wrote you: 

      ${req.body.message}`
    }

    mailOpts = {
      from: req.body.name  + ' &lt;' + req.body.email + '&gt;',
      to: process.env.GMAIL_USER,
      subject: `Contact form - ${req.body.subject}`,
      text: text
    }

    try {
      const emailNotification = await NotificationsController.emailNotification(mailOpts)
      if(emailNotification) {
        res.json(true) 
      } else {
        throw 'Email not sent' 
      }
    } catch(err) {
      console.log(err)
      res.status(500).json(err)
    }
  }
}