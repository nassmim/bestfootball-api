/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const LikeResult =  sequelize.define('like_result', {
    number:{
      type: DataTypes.INTEGER(11),
      allowNull: false,
    },
    point: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    footcoin: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    }    
  }, {
    tableName: 'like_result',
    timestamps: true,
    underscored: true,
    paranoid: true,
  });

  LikeResult.associate = models => {
  };

  return LikeResult;

};
