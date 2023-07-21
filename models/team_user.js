/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const TeamUser = sequelize.define('team_user', {     
  }, {
    tableName: 'team_user',
    timestamps: false,
    underscored: true
  });

  TeamUser.associate = models => {
    TeamUser.belongsTo(models.user)
    TeamUser.belongsTo(models.team)
      TeamUser.belongsTo(models.player_position)
  };

  return TeamUser;
};
