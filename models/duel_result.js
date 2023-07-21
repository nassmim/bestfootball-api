/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const DuelResult =  sequelize.define('duel_result', {
    name: {
      type: DataTypes.STRING(255),
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
    tableName: 'duel_result',
    timestamps: true,
    underscored: true
  });

  DuelResult.associate = models => {
    DuelResult.hasMany(models.duel)
  };

  return DuelResult;
};
