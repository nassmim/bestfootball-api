/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const ChallengeTutorial = sequelize.define('challenge_tutorial', {
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    french_description: {
      type: DataTypes.TEXT, 
      allowNull: true
    },
    english_description: {
      type: DataTypes.TEXT, 
      allowNull: true
    },
    tutorial_partner: {
      type: DataTypes.TEXT, 
      allowNull: true
    }, 
    tutorial_partner_link: {
      type: DataTypes.TEXT, 
      allowNull: true
    },      
    activated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },     
    bf_path: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    thumbnail_path: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  }, {
    tableName: 'challenge_tutorial',
    timestamps: true,
    underscored: true
  });

  ChallengeTutorial.associate = models => {
    ChallengeTutorial.belongsTo(models.user);
    ChallengeTutorial.belongsTo(models.team);
    ChallengeTutorial.belongsTo(models.challenge);
    ChallengeTutorial.belongsTo(models.challenge_category);
  };

  return ChallengeTutorial;
};
