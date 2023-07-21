/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  const PlayerPrice =  sequelize.define('player_price', {
    number_players:{
      type: DataTypes.INTEGER(11),
      allowNull: false,
    },
    monthly_price_euro: {
      type: DataTypes.FLOAT(11),
      allowNull: true
    },
    annual_reduction: {
      type: DataTypes.FLOAT(11),
      allowNull: true
    },    
  }, {
    tableName: 'player_price',
    timestamps: true,
    underscored: true,
    paranoid: true,
  });

  PlayerPrice.associate = models => {
  };

  return PlayerPrice;

};
