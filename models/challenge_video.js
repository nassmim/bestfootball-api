/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const ChallengeVideo = sequelize.define('challenge_video', {
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    score: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 0
    },
    point: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    footcoin: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    is_score_max: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },    
    view: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    like: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    }, 
    success: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    checked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    bf_path: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    thumbnail_path: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    featured: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },    
    enable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    tableName: 'challenge_video',
    timestamps: true,
    underscored: true
  });

  ChallengeVideo.associate = models => {
    ChallengeVideo.belongsTo(models.user);
    ChallengeVideo.belongsTo(models.team);
    ChallengeVideo.belongsTo(models.challenge);
    ChallengeVideo.belongsTo(models.challenge_category);
    ChallengeVideo.hasMany(models.challenge_video_comment);
  };

  return ChallengeVideo;
};
