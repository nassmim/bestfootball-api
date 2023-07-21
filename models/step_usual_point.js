/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const StepUsualPoint =  sequelize.define('step_usual_point', {
    step: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
    },
    point: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 0
    },
    footcoin: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'step_usual_point',
    timestamps: true,
    underscored: true
  });

  StepUsualPoint.associate = models => {
    StepUsualPoint.hasMany(models.duel)
  };

  return StepUsualPoint;
};
