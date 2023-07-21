'use strict'

const passport = require('passport');
const passportGoogle = require('passport-google-oauth');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env]

const models = require('../models')
const User = models.user


const passportConfig = {
    clientID: config.authentication.google.clientId.env,
    clientSecret: config.authentication.google.clientSecret.env,
};

if (passportConfig.clientID) {
    
    passport.use(new passportGoogle.OAuth2Strategy(passportConfig, async function (request, accessToken, refreshToken, profile, done) {

        try {

            let username = profile.displayName
            const usernameCheck = await User.findOne({where: {username: username}})

            if(usernameCheck) {
                username += " - " + profile.id
            }     

            let user = await User.findOrCreate({
                where: {
                    google_id: profile.id
                },
                defaults: {
                    username: username,
                    email: profile.emails[0].value
                }
            })

            user = user[0]
            const userJson = user.toJSON()
            userJson['profileUser'] = profile

            return done(null, userJson); 

        } catch(err) {
            console.log(err)
        }
    }));
}