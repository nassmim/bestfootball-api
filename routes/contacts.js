'use strict';
const router = require('express').Router();

const ContactController = require('../controllers/ContactController')


/* The user contacts us from the form page */
router.post('/form-page', (req, res, next) => {
  ContactController.contactUs(req, res)
})

module.exports = router;
