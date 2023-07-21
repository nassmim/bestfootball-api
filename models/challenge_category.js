/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const ChallengeCategory =  sequelize.define('challenge_category', {
    french_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    french_description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    english_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    english_description: {
      type: DataTypes.TEXT,
      allowNull: true
    },    
    french_best_skill: {
      type: DataTypes.TEXT,
      allowNull: true
    },  
    french_best_skill_short_name: {
      type: DataTypes.TEXT,
      allowNull: true
    }, 
    english_best_skill: {
      type: DataTypes.TEXT,
      allowNull: true
    },  
    english_best_skill_short_name: {
      type: DataTypes.TEXT,
      allowNull: true
    },          
  }, {
    tableName: 'challenge_category',
    timestamps: false,
    underscored: true
  });

  ChallengeCategory.associate = models => {
      ChallengeCategory.hasMany(models.challenge);
      ChallengeCategory.hasMany(models.challenge_video);
      ChallengeCategory.hasMany(models.duel);
      ChallengeCategory.hasMany(models.duel_summary);
      ChallengeCategory.hasMany(models.player, {foreignKey: 'best_skill_id', as: 'bestSkill'}); 
  };

  return ChallengeCategory;


};
