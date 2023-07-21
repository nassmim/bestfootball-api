'use strict';
const router = require('express').Router();
const multer = require('multer');
let path = require('path')
require('../controllers/google');
require('../controllers/facebook');
const passport = require('passport')
 
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env]
const rolesNames = config.roles

const models  = require('../models');
const User = models.user 

const UserController = require('../controllers/UserController')
const UploadController = require('../controllers/UploadController')

const originApiURL = `${process.env.API_PROTOCOL}://${process.env.API_DOMAIN}`
const originFrontURL = `${process.env.FRONT_PROTOCOL}://${process.env.FRONT_DOMAIN}`

function findFailureRedirectURL(provider) {
  return UserController.findFailureRedirectURL(provider)
}

function finaliseSocialAuthentication(req, res) {
    return UserController.finaliseSocialAuthentication(req, res)
}


// Sets up the location for uploaded users images
let storage = multer.diskStorage({
  destination: function (req, file, cb) {
        cb(null, `../${process.env.FRONT_FOLDER_NAME}/${process.env.PUBLIC_FOLDER_NAME}/upload/images/users`)
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
})
let upload = multer({ storage: storage })


/* Updates the user's avatar */
router.put('/upload/avatar', upload.single('file'),  (req, res, next) => {
  UploadController.uploadFile(req, res, 'Avatar') 
})

/* Registers a new user */
router.post('/sign-up', (req, res, next) => {
  UserController.signUp(req, res)
})

/* Passport authentications for Google and Facebook */
router
    .get('/socialauthentication/:provider/start/:role', (req, res, next) => {
        const scope = req.params.provider === 'facebook' ? ['email', 'public_profile'] : ['openid', 'profile', 'email']
        passport.authenticate(req.params.provider, {
            callbackURL: `${originApiURL}/user/socialauthentication/${req.params.provider}/redirect/${req.params.role}`,
            session: false,
            scope: scope
        })(req, res, next)
    })
    .get('/socialauthentication/:provider/redirect/:role', (req, res, next) => {
        passport.authenticate(req.params.provider, {
            callbackURL: `${originApiURL}/user/socialauthentication/${req.params.provider}/redirect/${req.params.role}`,
            failureRedirect: findFailureRedirectURL(req.params.provider),
            session: false
        })(req, res, next)
    },
        finaliseSocialAuthentication
    )

/* Updates the user's profile with his social network information and his role
this route is needed after a user signed up from the login page as at that time it was not possible to know his role. 
Now that he sent his choice from the front we can update his information */
router.put('/sign-up/update-social-profile', (req, res) => {
    UserController.finishUserSocialNetworkRegistration(req, res)
})

/* Activates the user's account */
router.put('/activate', (req, res, next) => {
  UserController.activate(req, res)
})

/* The user logs in */
router.put('/login', (req, res, next) => {
  UserController.login(req, res)
})

/* Gets all the user's profile information */
router.get('/profile-information/:identifier/:roles', (req, res, next) => {
  UserController.getUserProfile(req, res)
})

/* Updates the player's profile */
router.put('/update-profile', (req, res, next) => {
  UserController.updateProfile(req, res)
})

/* Update the player's account */
router.put('/update-account', (req, res, next) => {
  UserController.updateAccount(req, res)    
})

/* Updates the user's password */
router.put('/update-password', (req, res, next) => {
  UserController.udpatePassword(req, res)    
})

/* Updates the user's subscription identifiers */
router.put('/subscribe-notifications', (req, res, next) => {
  UserController.subscribeNotifications(req, res)    
})

/* The user asks for a password reset */
router.post('/password-forgotten', (req, res, next) => {
  UserController.askForPasswordReset(req, res)
})

/* The user renews his password */
router.put('/renew-password', (req, res, next) => {
  UserController.renewPassword(req, res)
})

/* The user sends to other users his mentor */
router.put('/mentoring', (req, res, next) => {
  UserController.sendMentorCode(req, res)
})

// The user removes his account
router.delete('/account/:id', (req, res, next) => {
  User.destroy({force: true, where: {id: req.params.id}})
    .then(()=>res.json(true))
    .catch(err=>res.json(false))
})


module.exports = router;
