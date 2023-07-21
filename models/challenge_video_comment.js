/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const ChallengeVideoComment =  sequelize.define('challenge_video_comment', {
    comment: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    enable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true 
    }
  }, {
    tableName: 'challenge_video_comment',
    timestamps: true,
    underscored: true,
    paranoid: true,
  });

  ChallengeVideoComment.associate = models => {
    ChallengeVideoComment.belongsTo(models.challenge_video);
    ChallengeVideoComment.belongsTo(models.user);
  };

  return ChallengeVideoComment;

};
