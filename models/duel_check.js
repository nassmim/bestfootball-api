/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const DuelCheck =  sequelize.define('duel_check', {
    succes: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
  }, {
    tableName: 'duel_check',
    underscored: true
  });

  DuelCheck.associate = models => {
      DuelCheck.belongsTo(models.duel);
  };

  return DuelCheck;
};
