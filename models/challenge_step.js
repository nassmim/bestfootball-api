/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const ChallengeStep =  sequelize.define('challenge_step', {
    challenge_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },    
    step: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    footcoin: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    point: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'challenge_step',
    timestamps: true,
    underscored: true,
    indexes: [{unique:true, fields:['challenge_id', 'step']}]
    });

  ChallengeStep.associate = models => {
      ChallengeStep.belongsTo(models.challenge);
  };

  return ChallengeStep;
};
