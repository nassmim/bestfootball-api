/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const likeGiven =  sequelize.define('like_given', {
  }, {
    tableName: 'like_given',
    timestamps: true,
    underscored: true,
    indexes: [{unique:true, fields:['challenge_video_id', 'user_id']}]
  });

  likeGiven.associate = models => {
    likeGiven.belongsTo(models.challenge_video);
    likeGiven.belongsTo(models.user);
  };

  return likeGiven;

};
