/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const DuelStatus =  sequelize.define('duel_status', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    tableName: 'duel_status',
    timestamps: true,
    underscored: true
  });

  DuelStatus.associate = models => {
    DuelStatus.hasMany(models.duel)
  };

  return DuelStatus;
};
