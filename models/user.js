/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    const User = sequelize.define('user', {
        email: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        facebook_id: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        google_id: {
            type: DataTypes.STRING(255),
            allowNull: true
        },        
        username: {
            type: DataTypes.STRING(255),
            allowNull: true,
        // unique: true
        },
        facebook_email: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },   
        google_email: {
            type: DataTypes.STRING(255),
            allowNull: true,
        }, 
        phone_number: {
            type: DataTypes.STRING(255),
            allowNull: true
        },              
        password: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        salt: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        token: {
                type: DataTypes.STRING(255),
                allowNull: true,
        },
        activated: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        first_connexion: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        defaultValue: true
        }, 
        forgotten: {
                type: DataTypes.STRING(1),
                allowNull: true,
        },
        number_mentored: {
                type: DataTypes.INTEGER(11),
                allowNull: true,
        },
        mentor_code: {
                type: DataTypes.STRING(8),
                allowNull: true,
        },
        notification_subscription_endpoint: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        notification_subscription_auth: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        notification_subscription_p256dh: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        roles: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
    }, {
        tableName: 'user',
        timestamps: true,
        underscored: true,
        paranoid: true,
    });
 
    User.associate = models => {
        User.hasOne(models.player);
        User.hasOne(models.coach);
        User.hasOne(models.club);
        User.hasMany(models.team_user)
        User.hasMany(models.challenge_video); 
        User.hasMany(models.challenge); 
        User.hasMany(models.duel, {foreignKey: 'user_asking_id', as: 'userAsking'})
        User.hasMany(models.duel, {foreignKey: 'user_asked_id', as: 'userAsked'})
        User.hasMany(models.duel_summary); 
        User.belongsTo(models.user, {foreignKey: 'mentor_id'});
        User.hasMany(models.like_given)
        User.hasMany(models.earning)
        User.hasMany(models.challenge_video_comment)
        User.belongsTo(models.address, {
            foreignKey: {
                name: 'address_id',
                defaultValue: 1
            },
        })   
  };

  return User;
  }
