/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const NotificationsSummary =  sequelize.define('notifications_summary', {
    number_errors: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
    }, 
    tag: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },       
  }, {
    tableName: 'notifications_summary',
    underscored: true
  });

  NotificationsSummary.associate = models => {
    NotificationsSummary.belongsTo(models.user);
  };

  return NotificationsSummary;
};
