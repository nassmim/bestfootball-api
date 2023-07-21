/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const Follow = sequelize.define('follow', {

    }, {
      timestamps: true,
      underscored: true,
      updatedAt: false,
      tableName: 'follow',
      indexes: [{unique:true, fields:['user_follower_id', 'user_following_id']}]
    });

  Follow.associate = models => {
    Follow.belongsTo(models.user, {foreignKey:'user_follower_id', as:'userFollower'});
    Follow.belongsTo(models.user, {foreignKey:'user_following_id', as:'userFollowing'});
  }

  return Follow;
};
