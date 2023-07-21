/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const CoachExercicePlayerScore = sequelize.define('coach_exercice_player_score', {
    player_attempt: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    player_success: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    rate_success: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },    
  }, {
    tableName: 'coach_exercice_player_score',
    timestamps: true,
    underscored: true
  });

  CoachExercicePlayerScore.associate = models => {
    CoachExercicePlayerScore.belongsTo(models.user);
    CoachExercicePlayerScore.belongsTo(models.coach_exercice);
  };

  return CoachExercicePlayerScore;
};
