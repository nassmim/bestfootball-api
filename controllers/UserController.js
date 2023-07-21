'use strict'

const crypto = require('crypto');
const Token = require('../config/token')
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env]
const rolesNames = config.roles

const models = require('../models') 
const ChallengeVideo = models.challenge_video
const ChallengeCategory = models.challenge_category
const UserStatus = models.user_status
const Player = models.player
const Coach = models.coach
const User = models.user
const Earning = models.earning
const Address = models.address
const Country = models.country
const City = models.city
const Team = models.team
const TeamUser = models.team_user
const Season = models.season
const Club = models.club
const PlayerCategory = models.player_category
const Position = models.player_position
const PreferredFoot = models.preferred_foot
const RegistrationResult = models.registration_result
const Role = models.role
const MentoringResult = models.mentoring_result
const PartnershipResult = models.partnership_result

const EarningController = require('../controllers/EarningController')
const MainController = require('../controllers/MainController')

const originFrontURL = `${process.env.FRONT_PROTOCOL}://${process.env.FRONT_DOMAIN}`

module.exports = {

    // Signs up the user 
    async signUp(req, res) {
        const userData = req.body,
            role = userData.roles,
            [templateId, subject] = selectMail(role)

        try {

            /* Look for a user with the same information as the one trying to sign up
            If it's a club signing up we don't care about the username request body. 
            Clubs will not even login thanks to their usernames but thanks to their email
            */

            let user = {}

            if(role === rolesNames.club) {

                user = await User.findOne({
                    where: { email: req.body.email }
                })

            } else {

                user = await User.findOne({
                    where: {
                        $or: [
                            {email: req.body.email},
                            {username: req.body.username},
                        ]    
                    }
                })
            }

            if (user) {
                /* Send a negative response as there is already a user which prevents 
                the user to sign up */
                const returnMessage = selectReturnCase(role, user.email, user.username, req.body.email, req.body.username)
                res.json(returnMessage) 

            } else {
                // This hashes the password and creates a token
                const [hashedPassword, token] = [utils.hashPassword(req.body.password), Math.random().toString(36).substr(2, 18)]
                req.body.password = hashedPassword.hash
                req.body.salt = hashedPassword.salt
                req.body.token = token

                if(role===rolesNames.club) {
                /* The user is a club therefore we need to create
                a new club or to update it as a registered club*/
				user = await createOrUpdateClub(userData)
				
                if(!user) {
                    /* There already is a club which is registered as a user */
                    return res.json(3)
                }

                } else {
                	user = await User.create(userData)
                }

                // Sends a welcome email
                sendWelcomeEmail(user.email, req.body.username, templateId, subject, req.headers.origin, req.body.sponsorship)

                res.json({user: user})
            }

        } catch(err) {
            console.log(err)
            res.status(500).json(err) 
        }
    },

	// Finalises the sign-up/login from facebook or google 
	async finaliseSocialAuthentication(req, res) {

		const user = req.user,
			userId = user.id,
			profile = user.profileUser,
			role = req.params.role,
			token = Token.generateAccessToken(user, userId)


		let redirectURL, model,
			userData = {
				token: token
			}

		if (user.first_connexion) {
			userData['roles'] = role
			userData['first_connexion'] = 0;
			// The user is signing up, he has no role so far, we use the one from the params in the request to get the right model
			model = MainController.selectUserModel(role)

			/* If the user used the social network connexion from the login page even though he was not registered yet
			he will not have any role associated 
			(we expect the user not to register like that but we cannot prevent him from doing it),
			i.e. no model will be found, by default we assign to him a player role
			*/
			model = model ? model : Player

			// This is the first connexion, so we consider it as a registration, we send a welcome email to this new user if we know what type of user he is
			if (Object.values(rolesNames).includes(role)) {
				this.selectAndSendWelcomeEmail(user)
			}

		} else {
			// The user already logged in before, he has an associated role already and we can get from it the right model to use 
			model = MainController.selectUserModel(user.roles)
		}

		try {

			await User.update(userData, { where: { id: userId } })

			// This is the social profile received from the social network authentication
			let createDataQuery = {
				where: { user_id: userId },
				defaults: {
					gender: profile.gender,
					avatar: profile.picture,
					birthdate: profile.birthday,
				}
			}

			// Will create or update the user's profile in the database
			this.findOrCreateProfile(model, createDataQuery, profile)

			/* Everything went correctly, 
			we can redirect the user to the screen for succeeded authentication  
			we include the user's role in the params, because if the user signed up from the login page, it will
			caught up on the front side and we will ask him to pick a role
			*/
			redirectURL = `${originFrontURL}/user/socialauthentication/finished/${userId}/${user.roles}`
			res.redirect(redirectURL)

		} catch (err) {
			console.log(err)
			redirectURL = `${originFrontURL}/user/socialauthentication/error/`
			return res.redirect(redirectURL)
		}
	},

	// Finishes the user registration in our db when he registered directly from the login page using social network apis
	async finishUserSocialNetworkRegistration(req, res) {
		const userId = req.body.userId,
			role = req.body.role

		try {

			if (role === rolesNames.coach) {
				// The user indicated he wants to be a coach 

				// As no role was initially associated to the user, a player role was assumed. We need to get back the social profile from the Player model
				const player = await Player.findOne({ where: { user_id: userId } })

				const createDataQuery = {
					user_id: player.user_id,
					gender: player.gender,
					avatar: player.picture,
					birthdate: player.birthday,
				}

				// Creates the coach model that should have been done if we knew the user wanted to be a coach
				Coach.create(createDataQuery)

				// Deletes the player profile since it is now useless
				Player.destroy({ force: true, where: { id: player.id } })
					.catch(err => { throw new Error(err) })
			}

			const user = await User.findByPk(userId)
			// Gives the user a role now that we know what he wants to be
			user.update({roles: role})

			// Sends the welcome email
			this.selectAndSendWelcomeEmail(user)

			res.status(200).json(true)

		} catch (err) {
			console.log(err)
			res.status(500).send(err);
		}
	},

    // Activates the user's account
    async activate(req, res) {

        try {

			const user = await User.findOne({
				include: {model: Coach, include: {model: Team, include: {model: Club}}},
				where: {
                    username: decodeURIComponent(req.body.username)
				}
			})

			if(user.activated===true) {
				// The user has already been activated
				res.json({alreadyActivated: true}) 
			} else {

				// Finds out which model to use (player, coach, club, etc.)
				const modelforNewUser = MainController.selectUserModel(user.roles)

				// Gets the associated id to this role as it will determine the amount of points earned for mentoring
				const userRole = await Role.findOne({
					where: {
						name: user.roles
					}
				}) 
				
				// Gets the mapping table user's role vs points/footcoins 
				const registrationResult = await RegistrationResult.findByPk(userRole.id)     

				// Checks if there is another user mentoring the new user and gives him the additional points if the mentor is a partner
				await this.updateUsersEarning(user, modelforNewUser, registrationResult, req.body.sponsorship, userRole.name)
                console.log(user.roles)
                // We do not want clubs to have usernames, it does not make sense and it makes the username verification process more complex, we'll think about it again later
                const newUsername = user.roles === rolesNames.club ? '' : user.username
                console.log(newUsername)
                await user.update({ username: newUsername, activated: true})
				res.json({user: user}) 
        	}

        } catch(err) {
			console.log(err)
			res.status(500).json(err) 
        }
    },


  /* Enables the user to log in */
  async login(req, res) {

    let user, isFirstConnexion = false

    try {

      user = await User.findOne({
        where: { 
          $or: [
            {email: req.body.identifier},
            {username: MainController.caseSensitive('username', decodeURIComponent(req.body.identifier))}
          ]
        }        
      })

      if (user) {
        
        if(!user.activated) {
          // The user has not yet activated his account 
          return res.json(2)
        }

        let hash = crypto.pbkdf2Sync(new Buffer(req.body.password, 'binary'), user.salt, 42000, 512, 'sha512');
        if (hash.toString('hex') != user.password)  {
          // The user has entered a wrong password
          return res.json(1)
        }

        let newToken = utils.generateToken({id: user.id, username: user.username});

        // This checks if it's the first time the user logs in
        if(user.first_connexion) {
          await user.update({first_connexion: false})
          isFirstConnexion = true // This will be of use on the front end part
        } 

        const includeUsed = this.buildIncludeQuery(user.roles)
        user = await User.findByPk(user.id, {
          include: includeUsed,
        })

        res.json({token: newToken, user: user, isFirstConnexion: isFirstConnexion})
        
      } else {
        // The user is not registered in the db 
        res.json(3)
      }

    } catch(err) {
      console.log(err)
      res.status(500).json(err)
    }    
  },


/* Get all user's profile information */
  async getUserProfile (req, res) {
    let roles = req.params.roles,
      dataQuery = {
        where: {
          $or: [
            {id: req.params.identifier},
                { username: decodeURIComponent(req.params.identifier)},
          ]          
        }
      }

    try {
      const user = await this.getUser(roles, dataQuery)
      res.json(user)
    } catch(err) {
      console.log(err)
      res.status(500).json(err)
    } 
  },

/* Get all user's profile information */
  async getUser(roles, dataQuery) {
    let user

    try {

      const includeQuery = this.buildIncludeQuery(roles)
      dataQuery['include'] = includeQuery

	  user = await User.findOne(dataQuery)

      return user

    } catch(err) {
      throw new Error(err)
    } 
  },

  // Get the user's status and best skill
  async getUserStatusAndSkill(userId, user, bestSkillThreshold) {

    try {

      const [currentStatus, nextStatus] = await getStatus(user)
      const categories = await ChallengeCategory.findAll()
      const [bestCategoryPoints, bestCategory] = await getBestSkill(userId, categories)

      let data = {
        user_status_id: currentStatus.id,
        user_next_status_id: currentStatus.id, 
      }

      if(nextStatus) {
        data['user_next_status_id'] = nextStatus.id     
      } 

      if(bestCategoryPoints>=bestSkillThreshold) {
        // the user has reached the required level 
        data['best_skill_id'] = bestCategory.id
      } 

      user.update(data)

    } catch(err) {
      console.log(err)
    }
  },

  // Enables the user to update his profile
  async updateAccount(req, res) {
    const userId = req.body.user_id
    const lastName = req.body.last_name
    const firstName = req.body.first_name
    const email = req.body.email
    const roles = req.body.roles

    let model = {}
    if(roles.includes(rolesNames.player)) {
      model = Player
    } else if(roles.includes(rolesNames.coach)) {
      model = Coach
    } else {
      model = Club
    }

    try {

      // Checks if the user can use the email he entered
      const check = await checkNewEmail(userId, email)
      
      if(check) {
        return res.json({emailAlreadyTaken: true})
      } 
      // The email does not exist in the db
      await User.update({email: email}, {
        where: {id: userId}
      })

      await model.update({
        last_name: lastName,
        first_name: firstName}, 
        {where: {user_id: userId}
      })

      res.json(true)

    } catch(err) {
      console.log(err)
      res.status(500).json(err)
    }
  },


  // Enables the user to update his profile
  async updateProfile(req, res) {
    const userId = req.body.user_id
    let dataQuery = req.body,
      model, userWhereQuery,
      includeQuery = this.buildIncludeQuery(req.body.roles)

    try {

      await updateAddressData(req.body.country, req.body.city, req.body.address, dataQuery)

      if(dataQuery.roles.includes(rolesNames.player)) {
        model = Player
        if(req.body.club) {
          await getClubId(req.body.club, dataQuery)          
        } 

      } else if(dataQuery.roles.includes(rolesNames.coach)) {
        model = Coach
      } else {
        model = Club
      }

      // Updates the user's profile
      userWhereQuery = {user_id: userId}
      await updateUser(model, dataQuery, userWhereQuery)

      // Updates the user's account
      userWhereQuery = {id: userId}
      await updateUser(User, dataQuery, userWhereQuery)

      const user = await User.findOne({
        include: includeQuery,
        where: userWhereQuery         
      })

      res.json(user) 

    } catch(err) {
      console.log(err)
      res.status(500).json(err)
    }
  },


  // Enables the user to update his password
  async udpatePassword(req, res) {
      const userId = req.body.userId
    let hashedPassword = utils.hashPassword(req.body.password)
    const password = hashedPassword.hash
    const salt = hashedPassword.salt

    try {

      await User.update({
        password: password,
        salt: salt
      }, {
        where: {id: userId}
      })

      res.json(true)  

    } catch(err) {
      console.log(err)
      res.status(500).json(err)
    }
  },


  // Gets all the users 
  async getUsers(req, res) {
    try {
      const users = await User.findAll({
        include: [
          {model: TeamUser},
          {model: Player},
          {model: Coach},
          {model: Club}
        ],
        order: ['username']
      })

      res.json(users) 

    } catch(err) {
      console.log(err)
      res.status(500).json(err)
    }
  },


  // Enables the user to subscribe to push notifications
  async subscribeNotifications(req, res) {
    const userId = req.body.userId

    try {
      const user = await User.findByPk(userId)

      let notificationSubscriptionEndpoint = null,
      notificationSubscriptionAuth = null,
      notificationSubscriptionP256dh = null

      if(req.body.notification_subscription) {
        notificationSubscriptionEndpoint = req.body.notification_subscription.endpoint,
        notificationSubscriptionAuth = req.body.notification_subscription.keys.auth,
        notificationSubscriptionP256dh = req.body.notification_subscription.keys.p256dh
      } 
     
      await user.update({
        notification_subscription_endpoint: notificationSubscriptionEndpoint,
        notification_subscription_auth: notificationSubscriptionAuth,
        notification_subscription_p256dh: notificationSubscriptionP256dh
      })

      res.json(user)

    } catch(err) {
      console.log(err)
      res.status(500).send(err);
    }
  },


  /* Enables the user to send his mentoring code */
  async sendMentorCode(req, res) {
    const mentorUsername = req.body.mentor_username
    let code = ""

    // Finds the user who's sending the sponsorship code
    User.findOne({where: {username: mentorUsername}})
    .then(currentUser => {
      if(currentUser.mentor_code) {
        code = currentUser.mentor_code;
      } else {
        // Creates a code as the user does not have one yet
        code = uuidV4().slice(0, 8)
      }

      const newData = {
        mentor_code: code
      }

      User.update(newData, {where: {username: mentorUsername}})

      // The next lines will send the emails to users
      sendEmailToMentored(mentorUsername, req.body.email1, code, req.headers.origin)
      sendEmailToMentored(mentorUsername, req.body.email2, code, req.headers.origin)
      sendEmailToMentored(mentorUsername, req.body.email3, code, req.headers.origin)
      sendEmailToMentored(mentorUsername, req.body.email4, code, req.headers.origin)
      sendEmailToMentored(mentorUsername, req.body.email5, code, req.headers.origin)

      res.json(true)
    })
    .catch((err) => {
       console.log(err)
       res.status(500).json(err)
    });
  },


  // Enables the user to reset his password 
  askForPasswordReset(req, res) {

    User.findOne({
      where: {
        email: req.body.email
      },
      attributes: ['email', 'forgotten', 'username']
    })

    .then(user => {

      const newData = {
          forgotten: 1
      }

      if (user) {

          User.update(newData, {where: {email: user.email}})
            .then(() => {
              sendEmailForPassword(user.username, user.email)
              return res.status(200).json(true)
          })

      } else {
        return res.status(200).json(false)
      }
    })
    .catch(err => res.status(500).json(err))
  },


  // Enables the user to change his password 
  async renewPassword(req, res) {

    User.findOne({
      where: {
        email: req.body.email
      },
      attributes: ['username', 'email', 'token', 'forgotten']
    })
    .then(user => {
      let hashedPassword = utils.hashPassword(req.body.password)
      let password = hashedPassword.hash;
      let salt = hashedPassword.salt;
      const newData = {
          password: password,
          salt: salt,
          forgotten: 0
      }

      if(user.forgotten == '1'){
        User.update(newData, {where: {email: req.body.email}})
        .then(() => {
          return res.status(200).json(true)
        })
      } 
    })
    .catch(err => res.status(409).json(err))
  },

  // Builds the query depending on the user's role
  buildIncludeQuery(roles) {
    let includeQuery
    const locationIncludeQuery = {model: Address, 
        include: {model: City, include: {model: Country}}}    

    if(roles.includes(rolesNames.coach)) {

		includeQuery = [
			locationIncludeQuery,
			{ model: Coach, required: true, include: { model: Team } },
			{ model: Earning, group: ['user.id'], attributes: [[models.sequelize.fn('sum', models.sequelize.col('earnings.footcoin')), 'totalFootcoins']] }
		] 

    } else if(roles.includes(rolesNames.club)) {

		includeQuery = [
			locationIncludeQuery,
			{ model: Club, required: true, include: { model: Team } },
			{ model: Earning, group: ['user.id'], attributes: [[models.sequelize.fn('sum', models.sequelize.col('earnings.footcoin')), 'totalFootcoins']] }
		] 

    } else {
		
	  includeQuery =[
		  locationIncludeQuery,
		  { model: TeamUser, include: { model: Team } },
		  {
			  model: Player, required: true, include: [
				  { model: ChallengeCategory, as: 'bestSkill' },
				  { model: UserStatus, as: 'userStatus' },
				  { model: UserStatus, as: 'userNextStatus' },
				  { model: PlayerCategory },
				  { model: Club }
			  ]
		  },
		  { model: Earning, group: ['user.id'], attributes: [[models.sequelize.fn('sum', models.sequelize.col('earnings.footcoin')), 'totalFootcoins']] }
	  ]		
	}

    return includeQuery 
  },


  // Updates the users points and footcoins
  async updateUsersEarning(user, modelforNewUser, registrationResult, sponsorship, role) {
    const originName="Inscription"
    let pointsEarned = 0, footcoinsEarned = 0, pointsEarnedSupp = 0, footcoinsEarnedSupp = 0 

    if(sponsorship && sponsorship !=='null') {
      [pointsEarnedSupp, footcoinsEarnedSupp] = await updateMentorEarning(sponsorship, roleId)
    }

    if(role===rolesNames.coach && !user.coach) {
      await modelforNewUser.create({user_id: user.id})
    } else {
    /* If it's a coach role but user.coach doesn't exist it means 
    the user was not added by club. Theses coaches don't earn points/footcoins */
      [pointsEarned, footcoinsEarned] = [registrationResult.point + pointsEarnedSupp, registrationResult.footcoin + footcoinsEarnedSupp]
      /* Updates the user's points & footcoins in the points summary table */       
      EarningController.updateOrCreate(user.id, originName, pointsEarned, footcoinsEarned)

      /* Updates the user's total points & footcoins earning */
      const newUser = await modelforNewUser.findOrCreate({
        where: {user_id: user.id},
        defaults: {
          total_point: pointsEarned,
          total_footcoin: footcoinsEarned
        }
      })          
      if(newUser[1]===false) {
      /* The user is already considered as a player 
      or a coach in the db which means the findOrCreate has not worked. 
      So, we need to update this player/coach in the db */          
        newUser[0].update({
          total_point: pointsEarned,
          total_footcoin: footcoinsEarned                
        })
      } 

		if (user.coach && user.coach.team && user.coach.team.club) {
      // The user is a coach added by a club, we give the points/footcoins to his club
        const club = await Club.findByPk(user.coach.team.club.id)      
        EarningController.updateOrCreate(club.id, originName, pointsEarned, footcoinsEarned)
      }           
    } 
  }, 

  findFailureRedirectURL() {
    const redirectURL = `${originFrontURL}/user/socialauthentication/error/`  
    return redirectURL
  },
  

  	// This creates or updates the user's profile 
	async findOrCreateProfile(model, createDataQuery, profile) {

		let newUser = []

		try {
			// Either finds a user matching the where clause or creates him with the properties in the default key
			newUser = await model.findOrCreate(createDataQuery)
		} catch (err) {
			throw new Error(err)
		}

		if (newUser[1] === false) {
			/* The user is already in our db, so a user has been found 
			we update this user in the db */
			newUser = newUser[0].update({
				gender: profile.gender,
				avatar: profile.picture,
				birthdate: profile.birthday,
			})
		} 
	},

  	// Selects the social network email and the template email to send and sends the welcome email to the user
	selectAndSendWelcomeEmail(user) {
		const [templateId, subject] = selectMail(user.roles)

		// Sends the welcome email
		sendWelcomeEmail(user.email, user.username, templateId, subject, originFrontURL)
	}   
}



/* Selects the message to display to the user if the 
sign-up process cannot be achieved */
function selectReturnCase(role, userEmail, UserUsername, email, username) {
    if(userEmail===email && UserUsername===username) {
        return role === rolesNames.club ? 2 : 1
    } else if(userEmail===email) {
        return 2
    } else {
        return 3
    }
}

// Creates or updates the club entered by the user while signing-up
async function createOrUpdateClub(userData) {
  const username = userData.username

  try {
    let club = await Club.findOne({
      where: {
        name: username
      }
    })

    if(!club || !club.is_registered) {
    // The club is not yet associated to a user
      const user = await User.create(userData)

      if(!club) {
      // The club is not even present in our database
        club = Club.create({
          name: username,
          user_id: user.id,
          is_registered: true
        })
      } else {
      // The club is in our database but not yet linked to any user
        club.update({
          user_id: user.id,
          is_registered: true
        })
      }

      return user

    } else {
      return false
    }

  } catch(err) {
    throw new Error(err)
  }
}

// Gets the user's status based on his total amount of points
async function getStatus(user) {

  try {
    // This gets the maximum points just below the user's points
    const currentStatusPoints = await UserStatus.max('point', {
      where: {
        point: {
          $lte: user.total_point
        }
      }
    })

    // This gets the exact status reached by the user 
    const currentStatus = await UserStatus.findOne({
      where: {
        point: currentStatusPoints
      }
    })

    // This gets the next status just above the user's one
    const nextStatus = await UserStatus.findOne({
      where: {
        point: {
          $gt: user.total_point
        }
      }
    })    

    return [currentStatus, nextStatus]

  } catch(err) {
    throw new Error(err)
  }
}

// Gets the user's best skill
async function getBestSkill(userId, categories) {
  let bestCategoryPoints = 0, // the category where the user earned the most
    bestCategory = "", 
    categoryPoints

  try {
    // For each category, this calculates the points earned by the user
    for(let i=0;i<categories.length;i++) {
      categoryPoints = await ChallengeVideo.sum('point', {
        where: {
          challenge_category_id: categories[i].id,
          user_id: userId
        }      
      })

      if(categoryPoints>bestCategoryPoints) {
        // the user earned more for this category than the others
        bestCategoryPoints = categoryPoints
        bestCategory = categories[i]
      }
    }

    return [bestCategoryPoints, bestCategory]

  } catch(err) {
    throw new Error(err)
  }
}

// Sends an email to the user
function sendWelcomeEmail(email, username, templateId, subject, headersOrigin, sponsorship) {
  const request = mailjet
    .post("send", {'version': 'v3.1'})
    .request({
      "Messages":[{
        "From": {
          "Email": "noreply@bestfootball.fr",
          "Name": "BestFootball"
        },
        "To": [
          {
            "Email": email,
            "Name": username
          }
        ],
        "TemplateID": templateId,
        "TemplateLanguage": true,
        "Subject": subject,
        "Variables": {
          "pseudo": username,
          "url": headersOrigin + '/user/activate/' + username + '/' + sponsorship
        }
      }]
    })
}


/* Gives to the mentor the amount of points/footcoins 
he must earn ang gets the additional points/footcoins to 
give to people he mentors */
async function updateMentorEarning(sponsorship, roleId) {

  try {
    const userMentor = await User.findOne({
      include: {model: Coach, include: {model: Team, include: {model: Club}}},
      where: {
        $or: [
          {mentor_code: sponsorship},
          {username: sponsorship},
          {email: sponsorship}
        ]
      }
    })

    /* Even though the user has indicated to be mentored, we
    need to check if the mentor really exists in our db */
    if(userMentor) {

      userMentor.update({
        nb_parrains: userMentor.nb_parrains + 1
      })
      
      // In case we have some partnership with the user 
      const [pointsEarnedSupp, footcoinsEarnedSupp] = await getMentorPoints(userMentor, 'Inscription')

      if(userMentor.coach && !userMentor.coach.belongs_to_club) {
      // The user is a coach who registered himself, we can stop here as he can't earn points/footcoins for himself
        return [pointsEarnedSupp, footcoinsEarnedSupp]
      }

      const [userMentorRoleId, modelforMentor] = MainController.selectUserModel(userMentor.roles)

      const originNameSponsorship="Parrainage"
      const mentoringResult = await MentoringResult.findOne({
        where: {
          role_mentored_id: roleId,
          role_mentoring_id: userMentorRoleId,
        }
      })   

      const [sponsorshipPointsEarned, sponsorshipfootcoinsEarned] = [mentoringResult.point, mentoringResult.footcoin]       
      /* We update the user's mentor's points & footcoins in the points summary table */       
      EarningController.updateOrCreate(userMentor.id, originNameSponsorship, sponsorshipPointsEarned, sponsorshipfootcoinsEarned) 

      if(userMentor.coach) {
      // The user is a coach added by a club
        const club = await Club.findByPk(userMentor.coach.team.club.id)
        EarningController.updateOrCreate(club.id, originNameSponsorship, sponsorshipPointsEarned, sponsorshipfootcoinsEarned) 
      }

      const newMentor = await modelforMentor.findOne({
        where: {
          user_id: userMentor.id
        }
      })

      newMentor.update({
        total_point: newMentor.total_point + sponsorshipPointsEarned,
        total_footcoin: newMentor.total_footcoin + sponsorshipfootcoinsEarned
      }) 

      return [pointsEarnedSupp, footcoinsEarnedSupp]
    } else {
      return [0, 0]
    }

  } catch(err) {
    console.log(err)
    return [0, 0]
  }
}


/* Defines how many points/footcoins to add when a user
signs-up being mentored by a partner */
async function getMentorPoints(userMentor, originName) {

  try {
    const originId = await MainController.getOriginId(originName)
    const partnershipResult = await PartnershipResult.findOne({
      where: {
        user_id: userMentor.id,
        origin_id: originId
      }
    })

    if(partnershipResult) {
      return [partnershipResult.point, partnershipResult.footcoin]
    } else {
      return [0, 0]
    }
  } catch(err) {
    return [0, 0]
  }
}

// Gets the user's address id
async function updateAddressData(countryName, cityName, addressName, dataQuery) {
  let cityId, 
  cityData = {},
  addressData = {}

  try {

    const country = await Country.findOne({
      where: {
        name: countryName
      }
    })
    
    cityData['country_id'] = country.id

    if(cityName) {
      const cityNameModified = MainController.capitalizeFirstLetter(cityName)
      cityData['name'] = cityNameModified
    } else {
      cityData['name'] = 'Ville non indiquée'
    }
    
    const city = await City.findOrCreate({
      where: cityData
    })

    addressData = {
      city_id: city[0].id
    }

    if(addressName) {
      addressData['address_1'] = addressName.toLowerCase()
    } else {
      addressData['address_1'] = 'Adresse non indiquée'
    }

    const address = await Address.findOrCreate({
      where: addressData
    })

    dataQuery['address_id'] = address[0].id

  } catch(err) {
    console.log(err)
  }
}

// Gets the user's club id 
async function getClubId(clubName, dataQuery) {

  try {
    const clubNameModified = MainController.capitalizeFirstLetter(clubName)
    const club = await Club.findOrCreate({
      where: {
        name: clubNameModified
      }
    })

    dataQuery['club_id'] = club[0].id

  } catch(err) {
    console.log(err)
  }
}

// Updates the model in the database
async function updateUser(model, data, userWhereQuery) {
  await model.update(data, {
    where: userWhereQuery
  })
}

/* Checks if the email chosen by the user while updating
his account is available*/
async function checkNewEmail(userId, email) {
  let check = false

  const userCheck = await User.findOne({where: {email: email}})

  if(userCheck) {
  // The email exists in the db
    if(userCheck.id!==userId) {
    // The email is associated to another account
      check = true
    }
  }

  return check
}

/* Defines the messages depending on the user's role */
function selectMail(role) {

  switch(role) {

    case rolesNames.coach:
      return [643239, "{{var:pseudo}}, bienvenue dans ton espace BestFootball"]        
      break

    case rolesNames.club:
      return [643241, "Bienvenue dans ton espace BestFootball"]
      break

    default:
      return [275789, "{{var:pseudo}}, bienvenue dans l'arène BestFootball"]   
  }
}

function sendEmailToMentored(mentorUsername, email, code, origin) {
  
  if (email.length) {
    User.findOne({where: {email: email}})
    .then(user=> {
      if(!user) {
        const data = {
          email: email,
          code: code,
        }

        const request = mailjet
        .post("send", {'version': 'v3.1'})
        .request({
          "Messages":[{
            "From": {
              "Email": "noreply@bestfootball.fr",
              "Name": "BestFootball Team"
            },
            "To": [{
              "Email": data.email,
              "Name": "BestFootball"
            }],
            "TemplateID": 454922,
            "TemplateLanguage": true,
            "Subject": "{{var:mentorUsername}} veut te parrainer",
            "Variables": {
              "mentorCode": data.code,
              "mentorUsername": mentorUsername,
              "urlHome": origin + "/sign-up/0"
            }
          }
          ]
        })
      }
    })
  }  
}

// This sends to the user an email so that he resets his password
function sendEmailForPassword(username, email) {

  const name = username ? username : email
  const request = mailjet
      .post("send", {'version': 'v3.1'})
      .request({
          "Messages": [
              {
                  "From": {
                      "Email": "noreply@bestfootball.fr",
                      "Name": "Equipe BestFootball"
                  },
                  "To": [
                      {
                          "Email": email,
                          "Name": name
                      }
                  ],
                  "TemplateID": 351703,
                  "TemplateLanguage": true,
                  "Subject": "{{var:pseudo}}, ton nouveau mot de passe BestFootball",
                  "Variables": {
                      "pseudo": name,
                      "url": originFrontURL + '/renew-password?email=' + email
                  }
              }
          ]
      })  
}