'use strict'

const models=require('../models') 
const secrets = require('../config/secrets');
const webPush = secrets.webPush
const nodemailer = require('nodemailer');

const User=models.user 
const NotificationsSummary =  models.notifications_summary


module.exports = {

  sendPushNotification(message, users) { 
		users.forEach(user=> {
			if(user.notification_subscription_endpoint) {
				// the user has subscribed to the notifications

				// Get his endpoint and auth keys 
			  let pushSubscription = {
			    endpoint: user.notification_subscription_endpoint,
			    keys: {
			      auth: user.notification_subscription_auth,
			      p256dh: user.notification_subscription_p256dh
			    }
			  } 

			  // Sends the notification to the user
			  sendPushNotificationToUser(message, pushSubscription)
			}
		})    
  },

  emailNotification(mailOpts) {
    let smtpTrans
    smtpTrans = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    })

    smtpTrans.sendMail(mailOpts, function (error, response) {
      if (error) {
        return false
      }
    }); 

    return true   
  }
}

// Sends the notification to a single user and handles the error tracking
function sendPushNotificationToUser(message, pushSubscription) {
  webPush.sendNotification(pushSubscription, JSON.stringify(message))
    .catch((err) => {
      User.findOne({
        where: {
           notification_subscription_endpoint: pushSubscription.endpoint
        }
      })
      .then(user=> {
      	/* Finds the user or adds the user in the notification summary table 
      	if he's not there yet */
      	NotificationsSummary.findOrCreate({
          where: {
            user_id: user.id,
            tag: message.tag
          }, defaults: {
            number_errors: 1,
          }
        }) 
        .then(notificationsummary=> {
          if(notificationsummary[1]===false) {
          	/* The user was already present in the table so we can 
          	increase his associated number of errors */
            notificationsummary[0].update({
              number_errors: notificationsummary[0].number_errors + 1,
            })
          }        	
        }).catch(err=> {console.log(err)})
      }).catch(err=> {console.log(err)})    	
      console.log(err)
    })
}        
