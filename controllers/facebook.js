'use strict'

const passport = require('passport');
const passportFacebook = require('passport-facebook');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env]

const models = require('../models')
const User = models.user


const passportConfig = {
    clientID: config.authentication.facebook.clientId.env,
    clientSecret: config.authentication.facebook.clientSecret.env,
    profileFields:['id', 'displayName', 'email', 'birthday', 'friends', 'first_name', 'last_name', 'middle_name', 'gender', 'link', "picture"]
};

if (passportConfig.clientID) {

    passport.use(new passportFacebook.Strategy(passportConfig, async function (accessToken, refreshToken, profile, done) {
        
        try {

            let username = profile.displayName
            const usernameCheck = await User.findOne({where: {username: username}})

            if(usernameCheck) {
                username += " - " + profile.id
            }      

            let user = await User.findOrCreate({
                where: {
                    facebook_id: profile.id
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
        return done(err);
        console.log(err)
        }
    }));
}