/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const Challenge =  sequelize.define('challenge', {
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: false
    },
    french_description: {
      type: DataTypes.TEXT, 
      allowNull: true
    },
    english_description: {
      type: DataTypes.TEXT, 
      allowNull: true
    },    
    french_trick_to_do: {
      type: DataTypes.TEXT, 
      allowNull: true
    },  
    english_trick_to_do: {
      type: DataTypes.TEXT, 
      allowNull: true
    },       
    challenge_partner: {
      type: DataTypes.TEXT, 
      allowNull: true
    }, 
    challenge_partner_link: {
      type: DataTypes.TEXT, 
      allowNull: true
    },    
    tutorial_video_link: {
      type: DataTypes.TEXT, 
      allowNull: true
    },       
    activated: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },  
    duel_activated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },    
    thumbnail_path: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    bf_path: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
      from_upload: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: true
      },    
    has_real_tutorial: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    challenge_coach_reward: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },        
  }, {
    tableName: 'challenge',
    timestamps: true,
    underscored: true
    });

  Challenge.associate = models => {
    Challenge.belongsTo(models.challenge_category);
    Challenge.belongsTo(models.user);
    Challenge.belongsTo(models.team);
    Challenge.hasOne(models.challenge_tutorial);
    Challenge.hasMany(models.challenge_video);
    Challenge.hasMany(models.duel);
    Challenge.hasMany(models.challenge_step);
    Challenge.hasMany(models.challenge_score_federation);
    Challenge.hasMany(models.duel_summary); 
  };

  return Challenge;
};
