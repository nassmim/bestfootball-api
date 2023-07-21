'use strict';
const router = require('express').Router();

const GiftsController = require('../controllers/GiftsController')


/* The user buys a gift */
router.post('/buy-one', (req, res, next) => { 
  GiftsController.buyGift(req, res)
})
 
/* Gets all the gifts */
router.get('/list/:forClubs/:userId/:size/:page', (req, res, next) => {
  GiftsController.getGifts(req, res)
})

/* The user goes to a specific gift page */
router.get('/presentation/:name', (req, res, next) => {
  GiftsController.getOneGift(req, res)
})


module.exports = router;
