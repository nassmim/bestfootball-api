/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const Season = sequelize.define('season', {
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  }, {
    tableName: 'season',
    timestamps: false,
    underscored: true
  });

  Season.associate = models => {
    Season.hasMany(models.team)
  };

  return Season;
};
