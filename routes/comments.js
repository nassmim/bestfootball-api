'use strict';
const router = require('express').Router();

const CommentsController = require('../controllers/CommentsController')


/* Adds a new comment */
router.post('/challenge-video', (req, res, next) => {
	CommentsController.commentVideo(req, res)
})

/* Gets all comments on a video */
router.get('/challenge-video/:id', (req, res, next) => {
   CommentsController.getAllComments(req, res)
})


module.exports = router;
