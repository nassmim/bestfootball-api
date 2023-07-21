'use strict'

var stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Find your endpoint's secret in your Dashboard's webhook settings
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const models = require('../models')
const Club = models.club
const Team = models.team
const PlayerPrice = models.player_price

module.exports = {

  async getPlayerPrices(req, res) {
    try {
      const playerPrices = await PlayerPrice.findAll()
      res.json(playerPrices)
    } catch(err) {
      console.log(err)
      res.status(500).json(err)      
    }
  },

  async completeCheckoutSession(req, res) {
    let sig = req.headers["stripe-signature"]
    const event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);

    try {
      // Handle the checkout.session.completed event
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object,
          club = await Club.findByPk(session.client_reference_id, {
            include: {model: Team}
          }),
          subscription = await stripe.subscriptions.retrieve(session.subscription)
          
        const subscribedTeams = club.teams.filter(team=> team.registered_by_club)
        subscribedTeams.forEach(team=> updateTeamSubscription(team, true))

        if(club.customer_id) {
        // The club already is a customer

          stripe.subscriptions.update(session.subscription, {
            trial_end: subscription.trial_end
          })
          // Removes the previous subscription created as we just need to update the existing one
          stripe.subscriptions.del(
            club.subscription_id, {prorate: true}
          )
        } 

        club.update({
          customer_id: session.customer,
          subscription_id: session.subscription,
          plan_id: subscription.items.data[0].plan.id
        })        
      }

      res.json({received: true})
    }

    catch (err) {
      console.log(err)
      res.status(500).json(err)
    }
  },


  // Updates the club's subscription payment period
    async updatePaymentsFrequency(req, res) {
    const clubId = req.body.club_id,
      planId = req.body.plan_id

    try {

      const club = await Club.findByPk(clubId)
      const subscription = await stripe.subscriptions.retrieve(club.subscription_id)
      const maxNumberPlayers = await PlayerPrice.max('number_players')
      const numberPlayers = club.total_number_players_allowed < maxNumberPlayers ? club.total_number_players_allowed : maxNumberPlayers
      stripe.subscriptions.update(club.subscription_id, {
        items: [{
          id: subscription.items.data[0].id,
          plan: planId,
          quantity: numberPlayers
        }]}, (err, subscription)=> {
          if(err) {
            throw new Error(err)
          }
        }
      )

      club.update({
        plan_id: planId
      }) 

      res.json(true)      

    } catch(err) {
      console.log(err)
      res.status(500).json(err)      
    }
  }
}

function updateTeamSubscription(team, activated) {
  team.update({activated: activated})
}