'use strict';
const router = require('express').Router();

const ClubsController = require('../controllers/ClubsController')

/* Gets all clubs */
router.get(['/player-prices', '/page/:page'], (req, res, next) => {
	ClubsController.getPlayerPrices(req, res)
})

/* Webhook event received from Stripe */
router.post(['/checkout/stripe-webhooks/completed-session', '/page/:page'], (req, res, next) => {
	ClubsController.completeCheckoutSession(req, res)
})

/* The users updates his subscription period */
router.put(['/subscriptions/update-payments-frequency', '/page/:page'], (req, res, next) => {
    ClubsController.updatePaymentsFrequency(req, res)
})
module.exports = router;
