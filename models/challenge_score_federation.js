/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const ChallengeScoreFederation =  sequelize.define('challenge_score_federation', { 
    score: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'challenge_score_federation',
    timestamps: true,
    underscored: true,
    indexes: [{unique:true, fields:['challenge_id', 'player_category_id']}]
    });

  ChallengeScoreFederation.associate = models => {
      ChallengeScoreFederation.belongsTo(models.challenge);
      ChallengeScoreFederation.belongsTo(models.player_category);
      ChallengeScoreFederation.belongsTo(models.country);
  };

  return ChallengeScoreFederation;
};
